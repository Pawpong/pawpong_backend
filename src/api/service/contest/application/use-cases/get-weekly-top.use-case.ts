import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { CONTEST_ASSET_URL_PORT, type ContestAssetUrlPort } from '../ports/contest-asset-url.port';
import { CONTEST_READER_PORT, type ContestEntrySnapshot, type ContestReaderPort } from '../ports/contest-reader.port';
import type { ContestEntryItem, GetWeeklyTopResult } from '../types/contest-result.type';

@Injectable()
export class GetWeeklyTopUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_ASSET_URL_PORT)
        private readonly assetUrl: ContestAssetUrlPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(): Promise<GetWeeklyTopResult | null> {
        this.logger.logStart('getWeeklyTop', '지난주 TOP 3 조회');

        const contest = await this.reader.findLatestEnded();
        if (!contest) {
            this.logger.logWarning('getWeeklyTop', '종료된 콘테스트 없음');
            return null;
        }

        const topEntries = await this.reader.findTopEntries(contest.id, 3);
        const entries = await this.resolveEntries(topEntries);

        this.logger.logSuccess('getWeeklyTop', '지난주 TOP 3 조회 완료', { count: entries.length });

        return {
            weekKey: this.buildWeekKey(contest.endDate),
            topEntries: entries,
            calculatedAt: contest.endDate,
        };
    }

    private async resolveEntries(snapshots: ContestEntrySnapshot[]): Promise<ContestEntryItem[]> {
        return Promise.all(
            snapshots.map(async (entry, index) => {
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
                    hasVoted: false,
                    isMyEntry: false,
                    createdAt: entry.createdAt,
                };
            }),
        );
    }

    /** ISO 8601 주차 키 계산 (예: endDate 2026-05-24 → "2026-W21") */
    private buildWeekKey(date: Date): string {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayOfWeek = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    }
}
