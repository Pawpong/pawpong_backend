import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { CONTEST_ASSET_URL_PORT, type ContestAssetUrlPort } from '../ports/contest-asset-url.port';
import { CONTEST_READER_PORT, type ContestEntrySnapshot, type ContestReaderPort } from '../ports/contest-reader.port';
import type { ContestEntryItem, GetYesterdayTopResult, YesterdayTopEntry } from '../types/contest-result.type';

@Injectable()
export class GetYesterdayTopUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_ASSET_URL_PORT)
        private readonly assetUrl: ContestAssetUrlPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(): Promise<GetYesterdayTopResult | null> {
        this.logger.logStart('getYesterdayTop', '어제 기준 TOP 3 조회');

        const contest = await this.reader.findActive();
        if (!contest) {
            this.logger.logWarning('getYesterdayTop', '진행 중인 콘테스트 없음');
            return null;
        }

        const [topEntries, totalEntries] = await Promise.all([
            this.reader.findTopEntries(contest.id, 3),
            this.reader.countEntries(contest.id),
        ]);

        const ranking = await this.resolveRanking(topEntries, totalEntries);

        this.logger.logSuccess('getYesterdayTop', '어제 기준 TOP 3 조회 완료', { count: ranking.length });

        return { contestId: contest.id, ranking };
    }

    private async resolveRanking(entries: ContestEntrySnapshot[], totalEntries: number): Promise<YesterdayTopEntry[]> {
        return Promise.all(
            entries.map(async (entry, index) => {
                const [photoUrl, profileImageUrl] = await Promise.all([
                    this.assetUrl.generateSignedUrl(entry.photoFileName),
                    entry.userProfileImageFileName
                        ? this.assetUrl.generateSignedUrl(entry.userProfileImageFileName)
                        : Promise.resolve<string | null>(null),
                ]);

                const item: ContestEntryItem = {
                    id: entry.id,
                    userId: entry.userId,
                    userDisplayName: entry.userDisplayName,
                    userProfileImageUrl: profileImageUrl,
                    photoUrl,
                    description: entry.description,
                    voteCount: entry.voteCount,
                    rank: entry.rank ?? index + 1,
                    hasVoted: false,
                    isMyEntry: false,
                    createdAt: entry.createdAt,
                };

                return {
                    rank: index + 1,
                    entry: item,
                    voteRate: this.calcVoteRate(entry.voteCount, totalEntries),
                };
            }),
        );
    }

    /** voteRate = (voteCount / totalEntries) * 100, 소수점 1자리 반올림. totalEntries=0 방어 */
    private calcVoteRate(voteCount: number, totalEntries: number): number {
        if (totalEntries === 0) return 0;
        return Math.round((voteCount / totalEntries) * 100 * 10) / 10;
    }
}
