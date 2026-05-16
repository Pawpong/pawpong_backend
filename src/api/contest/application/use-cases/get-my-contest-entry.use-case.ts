import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { CONTEST_ASSET_URL_PORT, type ContestAssetUrlPort } from '../ports/contest-asset-url.port';
import { CONTEST_READER_PORT, type ContestReaderPort } from '../ports/contest-reader.port';
import type { ContestEntryItem } from '../types/contest-result.type';

@Injectable()
export class GetMyContestEntryUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_ASSET_URL_PORT)
        private readonly assetUrl: ContestAssetUrlPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string): Promise<ContestEntryItem | null> {
        this.logger.logStart('getMyContestEntry', '나의 콘테스트 참여 항목 조회', { userId });

        const contest = await this.reader.findActive();
        if (!contest) {
            return null;
        }

        const entry = await this.reader.findEntryByUserId(contest.id, userId);
        if (!entry) {
            return null;
        }

        const votedEntryId = await this.reader.findVotedEntryId(contest.id, userId);

        const [photoUrl, profileImageUrl] = await Promise.all([
            this.assetUrl.generateSignedUrl(entry.photoFileName),
            entry.userProfileImageFileName
                ? this.assetUrl.generateSignedUrl(entry.userProfileImageFileName)
                : Promise.resolve<string | null>(null),
        ]);

        this.logger.logSuccess('getMyContestEntry', '나의 콘테스트 참여 항목 조회 완료');

        return {
            id: entry.id,
            userId: entry.userId,
            userDisplayName: entry.userDisplayName,
            userProfileImageUrl: profileImageUrl,
            photoUrl,
            description: entry.description,
            voteCount: entry.voteCount,
            rank: entry.rank,
            hasVoted: votedEntryId !== null,
            isMyEntry: true,
            createdAt: entry.createdAt,
        };
    }
}
