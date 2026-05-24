import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { CONTEST_ASSET_URL_PORT, type ContestAssetUrlPort } from '../ports/contest-asset-url.port';
import { CONTEST_READER_PORT, type ContestEntrySnapshot, type ContestReaderPort } from '../ports/contest-reader.port';
import type { ContestEntryItem, GetRandomEntryResult } from '../types/contest-result.type';

@Injectable()
export class GetRandomContestEntryUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_ASSET_URL_PORT)
        private readonly assetUrl: ContestAssetUrlPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string): Promise<GetRandomEntryResult> {
        this.logger.logStart('getRandomContestEntry', '랜덤 투표 후보 조회', { userId });

        const contest = await this.reader.findActive();
        if (!contest) {
            this.logger.logWarning('getRandomContestEntry', '진행 중인 콘테스트 없음');
            return { entry: null, alreadyVoted: false };
        }

        const votedEntryId = await this.reader.findVotedEntryId(contest.id, userId);
        if (votedEntryId !== null) {
            this.logger.logSuccess('getRandomContestEntry', '이미 투표 완료', { userId });
            return { entry: null, alreadyVoted: true };
        }

        const randomEntry = await this.reader.findRandomEntry(contest.id, userId);
        if (!randomEntry) {
            this.logger.logSuccess('getRandomContestEntry', '투표 가능한 후보 없음', { userId });
            return { entry: null, alreadyVoted: false };
        }

        const item = await this.resolveEntry(randomEntry, userId);

        this.logger.logSuccess('getRandomContestEntry', '랜덤 투표 후보 조회 완료', { entryId: randomEntry.id });
        return { entry: item, alreadyVoted: false };
    }

    private async resolveEntry(entry: ContestEntrySnapshot, userId: string): Promise<ContestEntryItem> {
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
            voteCount: null,
            rank: entry.rank,
            hasVoted: false,
            isMyEntry: userId === entry.userId,
            createdAt: entry.createdAt,
        };
    }
}
