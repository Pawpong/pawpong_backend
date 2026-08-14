import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { ContestVotingPolicyService } from '../../domain/services/contest-voting-policy.service';
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
        private readonly votingPolicy: ContestVotingPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(entryId: string, voterId: string): Promise<VoteContestEntryResult> {
        this.logger.logStart('voteContestEntry', '콘테스트 투표 시작', { entryId, voterId });

        const entry = await this.reader.findEntryById(entryId);
        if (!entry) {
            throw new BadRequestException('해당 콘테스트 항목을 찾을 수 없습니다.');
        }

        // 종료된 콘테스트는 결과가 확정된 상태이므로 투표로 집계를 바꿀 수 없다
        const contest = await this.reader.findContestById(entry.contestId);
        if (!contest) {
            throw new BadRequestException('해당 콘테스트를 찾을 수 없습니다.');
        }
        if (!this.votingPolicy.isOpenForVoting(contest)) {
            throw new BadRequestException('종료된 콘테스트에는 투표할 수 없습니다.');
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

        // 검증과 쓰기 사이에 콘테스트가 종료되는 경쟁을 사후 재검증으로 닫는다.
        // 종료가 감지되면 방금 넣은 투표를 되돌려 확정 결과를 보존한다.
        const contestAfterWrite = await this.reader.findContestById(entry.contestId);
        if (!contestAfterWrite || !this.votingPolicy.isOpenForVoting(contestAfterWrite)) {
            await this.rollbackVote(entry.contestId, entryId, voterId);
            throw new BadRequestException('종료된 콘테스트에는 투표할 수 없습니다.');
        }

        this.logger.logSuccess('voteContestEntry', '콘테스트 투표 완료', { entryId, newVoteCount });

        return { entryId, newVoteCount };
    }

    /** 종료 경쟁 감지 시 투표를 되돌린다. 되돌리기 실패는 로그로 남기고 원 흐름의 400 을 유지한다 */
    private async rollbackVote(contestId: string, entryId: string, voterId: string): Promise<void> {
        try {
            await this.writer.cancelVote({ contestId, entryId, voterId });
        } catch (error) {
            this.logger.logError('voteContestEntry', '종료 경쟁 보상(투표 되돌리기) 실패', error as Error);
        }
    }
}
