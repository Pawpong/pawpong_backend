import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { ContestVotingPolicyService } from '../../domain/services/contest-voting-policy.service';
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
        private readonly votingPolicy: ContestVotingPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(entryId: string, voterId: string): Promise<CancelContestVoteResult> {
        this.logger.logStart('cancelContestVote', '콘테스트 투표 취소 시작', { entryId, voterId });

        const entry = await this.reader.findEntryById(entryId);
        if (!entry) {
            throw new BadRequestException('해당 콘테스트 항목을 찾을 수 없습니다.');
        }

        // 종료된 콘테스트는 결과가 확정된 상태이므로 취소로 집계를 바꿀 수 없다 (명예의 전당 변조 방지)
        const contest = await this.reader.findContestById(entry.contestId);
        if (!contest) {
            throw new BadRequestException('해당 콘테스트를 찾을 수 없습니다.');
        }
        if (!this.votingPolicy.isOpenForVoting(contest)) {
            throw new BadRequestException('종료된 콘테스트의 투표는 취소할 수 없습니다.');
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

        // 검증과 쓰기 사이에 콘테스트가 종료되는 경쟁을 사후 재검증으로 닫는다.
        // 종료가 감지되면 방금 지운 투표를 복원해 확정 결과를 보존한다.
        const contestAfterWrite = await this.reader.findContestById(entry.contestId);
        if (!contestAfterWrite || !this.votingPolicy.isOpenForVoting(contestAfterWrite)) {
            await this.restoreVote(entry.contestId, entryId, voterId);
            throw new BadRequestException('종료된 콘테스트의 투표는 취소할 수 없습니다.');
        }

        this.logger.logSuccess('cancelContestVote', '콘테스트 투표 취소 완료', { entryId, newVoteCount });

        return { entryId, newVoteCount };
    }

    /** 종료 경쟁 감지 시 취소했던 투표를 복원한다. 복원 실패는 로그로 남기고 원 흐름의 400 을 유지한다 */
    private async restoreVote(contestId: string, entryId: string, voterId: string): Promise<void> {
        try {
            await this.writer.vote({ contestId, entryId, voterId });
        } catch (error) {
            this.logger.logError('cancelContestVote', '종료 경쟁 보상(투표 복원) 실패', error as Error);
        }
    }
}
