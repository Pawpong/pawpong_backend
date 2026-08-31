import { ContestFinalizationScheduler } from '../../infrastructure/contest-finalization.scheduler';

const logger = {
    logStart: jest.fn(),
    logSuccess: jest.fn(),
    logWarning: jest.fn(),
    logError: jest.fn(),
};

describe('ContestFinalizationScheduler', () => {
    const repository = { finalizeAllExpiredContests: jest.fn() };

    const scheduler = new ContestFinalizationScheduler(repository as any, logger as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        // onModuleInit 를 호출한 테스트가 남긴 타이머 정리
        scheduler.onModuleDestroy();
    });

    it('정상 — 만료 콘테스트가 확정되면 건수를 로그로 남긴다', async () => {
        repository.finalizeAllExpiredContests.mockResolvedValue(2);

        await scheduler.runOnce();

        expect(repository.finalizeAllExpiredContests).toHaveBeenCalledTimes(1);
        expect(logger.logSuccess).toHaveBeenCalledWith(
            'finalizeExpiredContests',
            expect.any(String),
            expect.objectContaining({ finalized: 2 }),
        );
    });

    it('정상 — 확정할 콘테스트가 없으면 조용히 지나간다', async () => {
        repository.finalizeAllExpiredContests.mockResolvedValue(0);

        await scheduler.runOnce();

        expect(logger.logSuccess).not.toHaveBeenCalled();
        expect(logger.logError).not.toHaveBeenCalled();
    });

    it('엣지 — 확정 실패는 기록만 하고 삼킨다 (다음 틱 재시도)', async () => {
        repository.finalizeAllExpiredContests.mockRejectedValue(new Error('DB down'));

        await expect(scheduler.runOnce()).resolves.toBeUndefined();
        expect(logger.logError).toHaveBeenCalled();
    });

    it('정상 — 부팅 시 즉시 1회 실행하고 주기 타이머를 등록한다', async () => {
        repository.finalizeAllExpiredContests.mockResolvedValue(0);

        await scheduler.onModuleInit();

        expect(repository.finalizeAllExpiredContests).toHaveBeenCalledTimes(1);
    });
});
