import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { CONTEST_ASSET_URL_PORT, type ContestAssetUrlPort } from '../ports/contest-asset-url.port';
import { CONTEST_READER_PORT, type ContestEntrySnapshot, type ContestReaderPort } from '../ports/contest-reader.port';
import type { ContestEntryItem, ContestInfo, GetCurrentContestResult } from '../types/contest-result.type';

@Injectable()
export class GetCurrentContestUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_ASSET_URL_PORT)
        private readonly assetUrl: ContestAssetUrlPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId?: string): Promise<GetCurrentContestResult | null> {
        this.logger.logStart('getCurrentContest', '현재 콘테스트 조회');

        const contest = await this.reader.findActive();
        if (!contest) {
            return null;
        }

        const [topEntries, votedEntryId, myEntry] = await Promise.all([
            this.reader.findTopEntries(contest.id, 3),
            userId ? this.reader.findVotedEntryId(contest.id, userId) : Promise.resolve<string | null>(null),
            userId ? this.reader.findEntryByUserId(contest.id, userId) : Promise.resolve(null),
        ]);

        const ranking = await this.resolveEntries(topEntries, userId, votedEntryId);

        const info: ContestInfo = {
            id: contest.id,
            title: contest.title,
            description: contest.description,
            benefitText: contest.benefitText,
            startDate: contest.startDate,
            endDate: contest.endDate,
            status: contest.status,
            participantCount: contest.participantCount,
        };

        this.logger.logSuccess('getCurrentContest', '현재 콘테스트 조회 완료', { contestId: contest.id });

        return {
            contest: info,
            ranking,
            myVotedEntryId: votedEntryId,
            hasEntry: !!myEntry,
        };
    }

    private async resolveEntries(
        entries: ContestEntrySnapshot[],
        userId: string | undefined,
        votedEntryId: string | null,
    ): Promise<ContestEntryItem[]> {
        return Promise.all(
            entries.map(async (entry, index) => {
                const [photoUrl, profileImageUrl] = await Promise.all([
                    this.assetUrl.generateSignedUrl(entry.photoFileName),
                    entry.userProfileImageFileName
                        ? this.assetUrl.generateSignedUrl(entry.userProfileImageFileName)
                        : Promise.resolve<string | null>(null),
                ]);

                return {
                    id: entry.id,
                    userId: entry.userId,
                    userDisplayName: entry.userDisplayName,
                    userProfileImageUrl: profileImageUrl,
                    photoUrl,
                    description: entry.description,
                    voteCount: entry.voteCount,
                    rank: entry.rank ?? index + 1,
                    hasVoted: votedEntryId === entry.id,
                    isMyEntry: userId === entry.userId,
                    createdAt: entry.createdAt,
                };
            }),
        );
    }
}
