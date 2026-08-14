import { BadRequestException } from '@nestjs/common';

import { CancelContestVoteUseCase } from '../../../application/use-cases/cancel-contest-vote.use-case';
import { ContestVotingPolicyService } from '../../../domain/services/contest-voting-policy.service';

const logger = {
    logStart: jest.fn(),
    logSuccess: jest.fn(),
    logWarning: jest.fn(),
    logError: jest.fn(),
};

const makeEntry = () => ({
    id: 'entry-1',
    contestId: 'contest-1',
    userId: 'owner-1',
    userDisplayName: '닉네임',
    userProfileImageFileName: null,
    photoFileName: 'photo.jpg',
    description: '설명',
    voteCount: 3,
    rank: null,
    status: 'active' as const,
    createdAt: new Date(),
});

const DAY_MS = 24 * 60 * 60 * 1000;

const makeContest = (status: 'active' | 'ended' = 'active', endDate = new Date(Date.now() + DAY_MS)) => ({
    id: 'contest-1',
    title: '이번주 명예의 전당',
    description: '설명',
    benefitText: '혜택',
    startDate: new Date(Date.now() - DAY_MS),
    endDate,
    status,
    participantCount: 1,
    createdAt: new Date(),
});

describe('CancelContestVoteUseCase', () => {
    const reader = { findEntryById: jest.fn(), findContestById: jest.fn(), findVotedEntryId: jest.fn() };
    const writer = { vote: jest.fn(), cancelVote: jest.fn(), finalizeExpiredContest: jest.fn() };

    const useCase = new CancelContestVoteUseCase(
        reader as any,
        writer as any,
        new ContestVotingPolicyService(),
        logger as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
        reader.findContestById.mockResolvedValue(makeContest('active'));
    });

    // ─── 정상 케이스 ───────────────────────────────────────────────

    it('정상 — 내가 투표한 항목 취소 성공, 취소 후 투표 수 반환', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findVotedEntryId.mockResolvedValue('entry-1');
        writer.cancelVote.mockResolvedValue({ status: 'ok', newVoteCount: 2 });

        const result = await useCase.execute('entry-1', 'voter-1');

        expect(writer.cancelVote).toHaveBeenCalledWith({
            contestId: 'contest-1',
            entryId: 'entry-1',
            voterId: 'voter-1',
        });
        expect(result).toEqual({ entryId: 'entry-1', newVoteCount: 2 });
    });

    // ─── 엣지 케이스 ───────────────────────────────────────────────

    it('엣지 — 존재하지 않는 항목 → BadRequest, writer 호출 안 됨', async () => {
        reader.findEntryById.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent', 'voter-1')).rejects.toThrow(BadRequestException);
        expect(writer.cancelVote).not.toHaveBeenCalled();
    });

    it('엣지 — 종료된 콘테스트의 투표 취소 시도 → BadRequest (확정 결과 변조 방지)', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findContestById.mockResolvedValue(makeContest('ended'));
        reader.findVotedEntryId.mockResolvedValue('entry-1');

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow(
            '종료된 콘테스트의 투표는 취소할 수 없습니다.',
        );
        expect(writer.cancelVote).not.toHaveBeenCalled();
    });

    it('엣지 — status 는 active 지만 endDate 가 지난 콘테스트 → 종료 확정(자기 치유) 후 BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findContestById.mockResolvedValue(makeContest('active', new Date(Date.now() - 60 * 1000)));
        reader.findVotedEntryId.mockResolvedValue('entry-1');

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow(
            '종료된 콘테스트의 투표는 취소할 수 없습니다.',
        );
        expect(writer.cancelVote).not.toHaveBeenCalled();
        expect(writer.finalizeExpiredContest).toHaveBeenCalledWith('contest-1');
    });

    it('엣지 — 검증-쓰기 사이 콘테스트 종료(경쟁) → 쓰기 게이트가 closed 반환 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findVotedEntryId.mockResolvedValue('entry-1');
        // 사전 검증은 통과했지만 트랜잭션 게이트가 종료를 원자적으로 감지한 상황
        writer.cancelVote.mockResolvedValue({ status: 'closed' });

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow(
            '종료된 콘테스트의 투표는 취소할 수 없습니다.',
        );
    });

    it('엣지 — 항목이 가리키는 콘테스트가 없음 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findContestById.mockResolvedValue(null);

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow(BadRequestException);
        expect(writer.cancelVote).not.toHaveBeenCalled();
    });

    it('엣지 — 이번 콘테스트에 투표한 내역 없음 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findVotedEntryId.mockResolvedValue(null);

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow(
            '이번 콘테스트에서 투표한 내역이 없습니다.',
        );
        expect(writer.cancelVote).not.toHaveBeenCalled();
    });

    it('엣지 — 내가 투표한 항목이 아닌 다른 항목 취소 시도 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findVotedEntryId.mockResolvedValue('entry-other');

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow('해당 항목에 투표한 내역이 없습니다.');
        expect(writer.cancelVote).not.toHaveBeenCalled();
    });

    it('엣지 — 조회와 삭제 사이 경합으로 이미 취소됨(writer not_voted 반환) → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findVotedEntryId.mockResolvedValue('entry-1');
        writer.cancelVote.mockResolvedValue({ status: 'not_voted' });

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow(BadRequestException);
    });
});
