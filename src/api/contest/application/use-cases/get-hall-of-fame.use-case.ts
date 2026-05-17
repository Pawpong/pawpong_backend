import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { CONTEST_ASSET_URL_PORT, type ContestAssetUrlPort } from '../ports/contest-asset-url.port';
import { CONTEST_READER_PORT, type ContestReaderPort } from '../ports/contest-reader.port';
import type { GetHallOfFameResult, HallOfFameItem } from '../types/contest-result.type';

export interface GetHallOfFameCommand {
    page: number;
    limit: number;
}

@Injectable()
export class GetHallOfFameUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_ASSET_URL_PORT)
        private readonly assetUrl: ContestAssetUrlPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(command: GetHallOfFameCommand): Promise<GetHallOfFameResult> {
        this.logger.logStart('getHallOfFame', '명예의 전당 조회');

        const { page, limit } = command;
        const [contests, total] = await Promise.all([
            this.reader.findAllEnded({ page, limit }),
            this.reader.countAllEnded(),
        ]);

        const items: HallOfFameItem[] = [];

        for (const contest of contests) {
            const topEntries = await this.reader.findTopEntries(contest.id, 1);
            if (topEntries.length === 0) continue;

            const winner = topEntries[0];
            const [photoUrl, profileImageUrl] = await Promise.all([
                this.assetUrl.generateSignedUrl(winner.photoFileName),
                winner.userProfileImageFileName
                    ? this.assetUrl.generateSignedUrl(winner.userProfileImageFileName)
                    : Promise.resolve<string | null>(null),
            ]);

            items.push({
                contestId: contest.id,
                contestTitle: contest.title,
                startDate: contest.startDate,
                endDate: contest.endDate,
                winner: {
                    id: winner.id,
                    userId: winner.userId,
                    userDisplayName: winner.userDisplayName,
                    userProfileImageUrl: profileImageUrl,
                    photoUrl,
                    description: winner.description,
                    voteCount: winner.voteCount,
                    rank: winner.rank ?? 1,
                    hasVoted: false,
                    isMyEntry: false,
                    createdAt: winner.createdAt,
                },
            });
        }

        this.logger.logSuccess('getHallOfFame', '명예의 전당 조회 완료', { count: items.length });

        return { items, total, page, limit };
    }
}
