import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { CONTEST_READER_PORT, type ContestReaderPort } from '../ports/contest-reader.port';
import { CONTEST_WRITER_PORT, type ContestWriterPort } from '../ports/contest-writer.port';
import type { VoteContestEntryResult } from '../types/contest-result.type';

@Injectable()
export class VoteContestEntryUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_WRITER_PORT)
        private readonly writer: ContestWriterPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(entryId: string, voterId: string): Promise<VoteContestEntryResult> {
        this.logger.logStart('voteContestEntry', '콘테스트 투표 시작', { entryId, voterId });

        const entry = await this.reader.findEntryById(entryId);
        if (!entry) {
            throw new BadRequestException('해당 콘테스트 항목을 찾을 수 없습니다.');
        }

        if (entry.userId === voterId) {
            throw new BadRequestException('자신의 항목에는 투표할 수 없습니다.');
        }

        const existingVote = await this.reader.findVotedEntryId(entry.contestId, voterId);
        if (existingVote) {
            throw new BadRequestException('이번 콘테스트에서 이미 투표하셨습니다.');
        }

        const newVoteCount = await this.writer.vote({
            contestId: entry.contestId,
            entryId,
            voterId,
        });

        this.logger.logSuccess('voteContestEntry', '콘테스트 투표 완료', { entryId, newVoteCount });

        return { entryId, newVoteCount };
    }
}
