import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { CONTEST_ASSET_URL_PORT, type ContestAssetUrlPort } from '../ports/contest-asset-url.port';
import { CONTEST_READER_PORT, type ContestEntrySnapshot, type ContestReaderPort } from '../ports/contest-reader.port';
import type { ContestEntryItem, GetContestEntriesResult } from '../types/contest-result.type';

export interface GetContestEntriesCommand {
    page: number;
    limit: number;
    userId?: string;
}

@Injectable()
export class GetContestEntriesUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_ASSET_URL_PORT)
        private readonly assetUrl: ContestAssetUrlPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(command: GetContestEntriesCommand): Promise<GetContestEntriesResult> {
        this.logger.logStart('getContestEntries', '콘테스트 항목 목록 조회');

        const contest = await this.reader.findActive();
        if (!contest) {
            throw new BadRequestException('현재 진행 중인 콘테스트가 없습니다.');
        }

        const { page, limit, userId } = command;

        const [entries, total, votedEntryId] = await Promise.all([
            this.reader.findEntries(contest.id, { page, limit }),
            this.reader.countEntries(contest.id),
            userId ? this.reader.findVotedEntryId(contest.id, userId) : Promise.resolve<string | null>(null),
        ]);

        const items = await this.resolveEntries(entries, userId, votedEntryId);

        this.logger.logSuccess('getContestEntries', '콘테스트 항목 목록 조회 완료', { count: items.length });

        return { items, total, page, limit };
    }

    private async resolveEntries(
        entries: ContestEntrySnapshot[],
        userId: string | undefined,
        votedEntryId: string | null,
    ): Promise<ContestEntryItem[]> {
        return Promise.all(
            entries.map(async (entry) => {
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
                    rank: entry.rank,
                    hasVoted: votedEntryId === entry.id,
                    isMyEntry: userId === entry.userId,
                    createdAt: entry.createdAt,
                };
            }),
        );
    }
}
