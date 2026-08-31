import { BadRequestException } from '@nestjs/common';

import { VoteContestEntryUseCase } from '../../../application/use-cases/vote-contest-entry.use-case';
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

describe('VoteContestEntryUseCase', () => {
    const reader = { findEntryById: jest.fn(), findContestById: jest.fn(), findVotedEntryId: jest.fn() };
    const writer = { vote: jest.fn(), cancelVote: jest.fn(), finalizeExpiredContest: jest.fn() };

    const useCase = new VoteContestEntryUseCase(
        reader as any,
        writer as any,
        new ContestVotingPolicyService(),
        logger as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
        reader.findContestById.mockResolvedValue(makeContest('active'));
        reader.findVotedEntryId.mockResolvedValue(null);
    });

    // ─── 정상 케이스 ───────────────────────────────────────────────

    it('정상 — 열린 콘테스트의 타인 항목 투표 성공', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        writer.vote.mockResolvedValue({ status: 'ok', newVoteCount: 4 });

        const result = await useCase.execute('entry-1', 'voter-1');

        expect(writer.vote).toHaveBeenCalledWith({
            contestId: 'contest-1',
            entryId: 'entry-1',
            voterId: 'voter-1',
        });
        expect(result).toEqual({ entryId: 'entry-1', newVoteCount: 4 });
    });

    // ─── 엣지 케이스 ───────────────────────────────────────────────

    it('엣지 — 종료(ended)된 콘테스트 투표 시도 → BadRequest, writer 호출 안 됨', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findContestById.mockResolvedValue(makeContest('ended'));

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow('종료된 콘테스트에는 투표할 수 없습니다.');
        expect(writer.vote).not.toHaveBeenCalled();
        // 이미 ended 인 콘테스트는 자기 치유 대상이 아니다
        expect(writer.finalizeExpiredContest).not.toHaveBeenCalled();
    });

    it('엣지 — status 는 active 지만 endDate 가 지난 콘테스트 → 종료 확정(자기 치유) 후 BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findContestById.mockResolvedValue(makeContest('active', new Date(Date.now() - 60 * 1000)));

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow('종료된 콘테스트에는 투표할 수 없습니다.');
        expect(writer.vote).not.toHaveBeenCalled();
        expect(writer.finalizeExpiredContest).toHaveBeenCalledWith('contest-1');
    });

    it('엣지 — 검증-쓰기 사이 콘테스트 종료(경쟁) → 쓰기 게이트가 closed 반환 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        // 사전 검증은 통과했지만 트랜잭션 게이트가 종료를 원자적으로 감지한 상황
        writer.vote.mockResolvedValue({ status: 'closed' });

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow('종료된 콘테스트에는 투표할 수 없습니다.');
    });

    it('엣지 — 검증-쓰기 사이 동일 유저 중복 투표 경합 → 쓰기가 duplicate 반환 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        writer.vote.mockResolvedValue({ status: 'duplicate' });

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow('이번 콘테스트에서 이미 투표하셨습니다.');
    });

    it('엣지 — 자신의 항목 투표 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());

        await expect(useCase.execute('entry-1', 'owner-1')).rejects.toThrow('자신의 항목에는 투표할 수 없습니다.');
        expect(writer.vote).not.toHaveBeenCalled();
    });

    it('엣지 — 이미 투표한 콘테스트 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findVotedEntryId.mockResolvedValue('entry-other');

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow('이번 콘테스트에서 이미 투표하셨습니다.');
        expect(writer.vote).not.toHaveBeenCalled();
    });

    it('엣지 — 존재하지 않는 항목 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent', 'voter-1')).rejects.toThrow(BadRequestException);
        expect(writer.vote).not.toHaveBeenCalled();
    });
});
