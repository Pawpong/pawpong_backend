import { BadRequestException } from '@nestjs/common';

import { UpdateContestEntryStatusUseCase } from '../../../application/use-cases/update-contest-entry-status.use-case';

const logger = {
    logStart: jest.fn(),
    logSuccess: jest.fn(),
    logWarning: jest.fn(),
    logError: jest.fn(),
};

const makeEntry = (status: 'active' | 'hidden' | 'deleted') => ({
    id: 'entry-1',
    contestId: 'contest-1',
    userId: 'user-1',
    userDisplayName: '닉네임',
    userProfileImageFileName: null,
    photoFileName: 'photo.jpg',
    description: '설명',
    voteCount: 5,
    rank: null,
    status,
    createdAt: new Date(),
});

describe('UpdateContestEntryStatusUseCase', () => {
    const reader = { findEntryById: jest.fn() };
    const adminWriter = { updateEntryStatus: jest.fn() };

    const useCase = new UpdateContestEntryStatusUseCase(
        reader as any,
        adminWriter as any,
        logger as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
        adminWriter.updateEntryStatus.mockResolvedValue(undefined);
    });

    // ─── 정상 케이스 ───────────────────────────────────────────────

    it('정상 — active → hidden 상태 변경 성공', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry('active'));

        await useCase.execute('entry-1', 'hidden');

        expect(adminWriter.updateEntryStatus).toHaveBeenCalledWith('entry-1', 'hidden');
    });

    it('정상 — active → deleted 상태 변경 성공', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry('active'));

        await useCase.execute('entry-1', 'deleted');

        expect(adminWriter.updateEntryStatus).toHaveBeenCalledWith('entry-1', 'deleted');
    });

    it('정상 — hidden → deleted 변경 가능', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry('hidden'));

        await useCase.execute('entry-1', 'deleted');

        expect(adminWriter.updateEntryStatus).toHaveBeenCalledWith('entry-1', 'deleted');
    });

    // ─── 엣지 케이스 ───────────────────────────────────────────────

    it('엣지 — 존재하지 않는 entryId → BadRequest, writer 호출 안 됨', async () => {
        reader.findEntryById.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent', 'hidden')).rejects.toThrow(BadRequestException);
        expect(adminWriter.updateEntryStatus).not.toHaveBeenCalled();
    });

    it('엣지 — deleted 항목 → hidden으로 변경 시도 → BadRequest (소프트 삭제 복원 불가)', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry('deleted'));

        await expect(useCase.execute('entry-1', 'hidden')).rejects.toThrow(BadRequestException);
        expect(adminWriter.updateEntryStatus).not.toHaveBeenCalled();
    });

    it('엣지 — deleted 항목 → deleted 재시도 → BadRequest', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry('deleted'));

        await expect(useCase.execute('entry-1', 'deleted')).rejects.toThrow(BadRequestException);
        expect(adminWriter.updateEntryStatus).not.toHaveBeenCalled();
    });

    it('엣지 — hidden → hidden 재시도 → BadRequest (이미 같은 상태)', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry('hidden'));

        await expect(useCase.execute('entry-1', 'hidden')).rejects.toThrow(BadRequestException);
        expect(adminWriter.updateEntryStatus).not.toHaveBeenCalled();
    });

    it('엣지 — active → active 재시도 → BadRequest (이미 같은 상태)', async () => {
        reader.findEntryById.mockResolvedValue(makeEntry('active'));

        await expect(useCase.execute('entry-1', 'active' as any)).rejects.toThrow(BadRequestException);
        expect(adminWriter.updateEntryStatus).not.toHaveBeenCalled();
    });
});
