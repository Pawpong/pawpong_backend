import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { CONTEST_READER_PORT, type ContestReaderPort } from '../ports/contest-reader.port';
import { CONTEST_WRITER_PORT, type ContestWriterPort } from '../ports/contest-writer.port';
import type { CancelContestVoteResult } from '../types/contest-result.type';

/**
 * 콘테스트 투표 취소.
 * 유저는 콘테스트당 1표만 가지므로, 취소 대상은 "그 콘테스트에서 내가 투표한 항목"이어야 한다.
 * 다른 항목을 지목해 취소하면 실투표가 지워지지 않도록 명시적으로 거부한다.
 */
@Injectable()
export class CancelContestVoteUseCase {
    constructor(
        @Inject(CONTEST_READER_PORT)
        private readonly reader: ContestReaderPort,
        @Inject(CONTEST_WRITER_PORT)
        private readonly writer: ContestWriterPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(entryId: string, voterId: string): Promise<CancelContestVoteResult> {
        this.logger.logStart('cancelContestVote', '콘테스트 투표 취소 시작', { entryId, voterId });

        const entry = await this.reader.findEntryById(entryId);
        if (!entry) {
            throw new BadRequestException('해당 콘테스트 항목을 찾을 수 없습니다.');
        }

        const votedEntryId = await this.reader.findVotedEntryId(entry.contestId, voterId);
        if (!votedEntryId) {
            throw new BadRequestException('이번 콘테스트에서 투표한 내역이 없습니다.');
        }
        if (votedEntryId !== entryId) {
            throw new BadRequestException('해당 항목에 투표한 내역이 없습니다.');
        }

        const newVoteCount = await this.writer.cancelVote({
            contestId: entry.contestId,
            entryId,
            voterId,
        });
        // 조회와 삭제 사이에 다른 요청이 먼저 취소한 경우 (동시 요청 방어)
        if (newVoteCount === null) {
            throw new BadRequestException('이번 콘테스트에서 투표한 내역이 없습니다.');
        }

        this.logger.logSuccess('cancelContestVote', '콘테스트 투표 취소 완료', { entryId, newVoteCount });

        return { entryId, newVoteCount };
    }
}
