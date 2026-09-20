import { OPS_PENDING_KIND } from '../../../events/ops-pending.event';
import { CustomLoggerService } from '../../../logger/custom-logger.service';
import { OpsPendingEventListener } from '../../infrastructure/ops-pending-event.listener';

describe('OpsPendingEventListener', () => {
    let recordUseCase: { execute: jest.Mock };
    let resolveUseCase: { execute: jest.Mock };
    let logger: { logError: jest.Mock };

    const buildListener = () =>
        new OpsPendingEventListener(
            recordUseCase as never,
            resolveUseCase as never,
            logger as unknown as CustomLoggerService,
        );

    beforeEach(() => {
        recordUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
        resolveUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
        logger = { logError: jest.fn() };
    });

    it('적재 실패를 에러 로그로 남기고 요청 흐름은 깨지 않는다', async () => {
        // 알림 적재가 실패했다고 신고 접수 자체가 500 이 되면 안 되고,
        // 조용히 사라져서도 안 된다 — 로그로 추적할 수 있어야 한다
        recordUseCase.execute.mockRejectedValueOnce(new Error('db down'));

        await expect(
            buildListener().handleCreated({
                kind: OPS_PENDING_KIND.BREEDER_REPORT,
                referenceId: 'report-1',
                summary: '신고 접수',
            }),
        ).resolves.toBeUndefined();

        expect(logger.logError).toHaveBeenCalledWith('opsPendingCreated', expect.any(String), expect.any(Error));
    });

    it('종료 실패는 리마인드가 계속될 수 있다는 경고와 함께 남긴다', async () => {
        resolveUseCase.execute.mockRejectedValueOnce(new Error('db down'));

        await expect(
            buildListener().handleResolved({
                kind: OPS_PENDING_KIND.BREEDER_REPORT,
                referenceId: 'report-1',
                resolution: 'resolve',
            }),
        ).resolves.toBeUndefined();

        expect(logger.logError).toHaveBeenCalledWith(
            'opsPendingResolved',
            expect.stringContaining('리마인드'),
            expect.any(Error),
        );
    });
});
