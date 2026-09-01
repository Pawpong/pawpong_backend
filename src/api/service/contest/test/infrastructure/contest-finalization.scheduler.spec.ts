import { DatabaseReadinessService } from '../../../../../common/database/database-readiness.service';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { ContestFinalizationScheduler } from '../../infrastructure/contest-finalization.scheduler';
import { ContestRepository } from '../../repository/contest.repository';

const logger = {
    logStart: jest.fn(),
    logSuccess: jest.fn(),
    logWarning: jest.fn(),
    logError: jest.fn(),
};

describe('ContestFinalizationScheduler', () => {
    const repository = { finalizeAllExpiredContests: jest.fn() };
    const databaseReadiness = { check: jest.fn() };
    let scheduler: ContestFinalizationScheduler;

    beforeEach(() => {
        jest.clearAllMocks();
        databaseReadiness.check.mockResolvedValue({
            status: 'healthy',
            connectionState: 'connected',
            latencyMs: 1,
        });
        scheduler = new ContestFinalizationScheduler(
            repository as unknown as ContestRepository,
            logger as unknown as CustomLoggerService,
            databaseReadiness as unknown as DatabaseReadinessService,
        );
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

    it('DB ping 실패 시 repository를 호출하지 않고 첫 실패만 기록한다', async () => {
        databaseReadiness.check.mockResolvedValue({
            status: 'unhealthy',
            connectionState: 'connected',
            latencyMs: 3000,
        });

        await scheduler.runOnce();
        await scheduler.runOnce();

        expect(repository.finalizeAllExpiredContests).not.toHaveBeenCalled();
        expect(logger.logError).toHaveBeenCalledTimes(1);
    });

    it('연속 장애 로그는 첫 회와 5회 단위로만 남긴다', async () => {
        databaseReadiness.check.mockResolvedValue({
            status: 'unhealthy',
            connectionState: 'connected',
            latencyMs: 3000,
        });

        for (let attempt = 0; attempt < 6; attempt += 1) {
            await scheduler.runOnce();
        }

        expect(logger.logError).toHaveBeenCalledTimes(2);
    });

    it('DB 장애 뒤 성공하면 복구 횟수를 로그로 남긴다', async () => {
        databaseReadiness.check
            .mockResolvedValueOnce({ status: 'unhealthy', connectionState: 'connected', latencyMs: 3000 })
            .mockResolvedValueOnce({ status: 'healthy', connectionState: 'connected', latencyMs: 4 });
        repository.finalizeAllExpiredContests.mockResolvedValue(0);

        await scheduler.runOnce();
        await scheduler.runOnce();

        expect(logger.logSuccess).toHaveBeenCalledWith('finalizeExpiredContests', expect.stringContaining('복구'), {
            failedAttempts: 1,
        });
    });

    it('이전 실행이 끝나지 않았으면 같은 Promise를 공유해 중복 확정을 막는다', async () => {
        let resolveFinalization: (value: number) => void = () => undefined;
        repository.finalizeAllExpiredContests.mockImplementation(
            () =>
                new Promise<number>((resolve) => {
                    resolveFinalization = resolve;
                }),
        );

        const firstRun = scheduler.runOnce();
        const secondRun = scheduler.runOnce();
        await Promise.resolve();

        expect(firstRun).toBe(secondRun);
        expect(databaseReadiness.check).toHaveBeenCalledTimes(1);
        expect(repository.finalizeAllExpiredContests).toHaveBeenCalledTimes(1);

        resolveFinalization(0);
        await Promise.all([firstRun, secondRun]);
    });

    it('정상 — 부팅 시 즉시 1회 실행하고 주기 타이머를 등록한다', async () => {
        repository.finalizeAllExpiredContests.mockResolvedValue(0);

        await scheduler.onModuleInit();

        expect(repository.finalizeAllExpiredContests).toHaveBeenCalledTimes(1);
    });
});
