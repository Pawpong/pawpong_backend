import { BadRequestException } from '@nestjs/common';

import { CancelContestVoteUseCase } from '../../../application/use-cases/cancel-contest-vote.use-case';

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

const makeContest = (status: 'active' | 'ended' = 'active') => ({
    id: 'contest-1',
    title: '이번주 명예의 전당',
    description: '설명',
    benefitText: '혜택',
    startDate: new Date(),
    endDate: new Date(),
    status,
    participantCount: 1,
    createdAt: new Date(),
});

describe('CancelContestVoteUseCase', () => {
    const reader = { findEntryById: jest.fn(), findContestById: jest.fn(), findVotedEntryId: jest.fn() };
    const writer = { cancelVote: jest.fn() };

    const useCase = new CancelContestVoteUseCase(reader as any, writer as any, logger as any);

    beforeEach(() => {
        jest.clearAllMocks();
        reader.findContestById.mockResolvedValue(makeContest('active'));
    });

    // ─── 정상 케이스 ───────────────────────────────────────────────

    it('정상 — 내가 투표한 항목 취소 성공, 취소 후 투표 수 반환', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findVotedEntryId.mockResolvedValue('entry-1');
        writer.cancelVote.mockResolvedValue(2);

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

    it('엣지 — 조회와 삭제 사이 경합으로 이미 취소됨(writer null 반환) → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry());
        reader.findVotedEntryId.mockResolvedValue('entry-1');
        writer.cancelVote.mockResolvedValue(null);

        await expect(useCase.execute('entry-1', 'voter-1')).rejects.toThrow(BadRequestException);
    });
});
