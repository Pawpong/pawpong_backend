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

        // 종료된 콘테스트는 결과가 확정된 상태이므로 투표로 집계를 바꿀 수 없다.
        // 여기서의 사전 검증은 빠른 거부용이고, 최종 판정은 쓰기 트랜잭션의 게이트가 원자적으로 수행한다.
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

        const written = await this.writer.vote({
            contestId: entry.contestId,
            entryId,
            voterId,
        });
        if (written.status === 'closed') {
            throw new BadRequestException('종료된 콘테스트에는 투표할 수 없습니다.');
        }
        if (written.status === 'duplicate') {
            throw new BadRequestException('이번 콘테스트에서 이미 투표하셨습니다.');
        }

        this.logger.logSuccess('voteContestEntry', '콘테스트 투표 완료', {
            entryId,
            newVoteCount: written.newVoteCount,
        });

        return { entryId, newVoteCount: written.newVoteCount };
    }
}
