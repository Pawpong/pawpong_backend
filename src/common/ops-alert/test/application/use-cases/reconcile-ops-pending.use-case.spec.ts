import { ConfigService } from '@nestjs/config';

import { OPS_PENDING_KIND } from '../../../../events/ops-pending.event';
import { CustomLoggerService } from '../../../../logger/custom-logger.service';
import { ReconcileOpsPendingUseCase } from '../../../application/use-cases/reconcile-ops-pending.use-case';
import { OpsAlertPresenterService } from '../../../domain/services/ops-alert-presenter.service';

describe('ReconcileOpsPendingUseCase', () => {
    const now = new Date('2026-09-20T00:00:00.000Z');

    let eventRepository: {
        findOpenReferenceIds: jest.Mock;
        findOpenEventsToCheck: jest.Mock;
        markChecked: jest.Mock;
        insert: jest.Mock;
        resolve: jest.Mock;
    };
    let sourceRepository: { listPendingReferenceIds: jest.Mock; isStillPending: jest.Mock };
    let logger: { logSuccess: jest.Mock; logWarning: jest.Mock; logError: jest.Mock };

    const buildUseCase = () =>
        new ReconcileOpsPendingUseCase(
            eventRepository as never,
            sourceRepository as never,
            new OpsAlertPresenterService(),
            { get: (key: string) => (key === 'APP_ENV' ? 'production' : undefined) } as ConfigService,
            logger as unknown as CustomLoggerService,
        );

    beforeEach(() => {
        eventRepository = {
            findOpenReferenceIds: jest.fn().mockResolvedValue([]),
            findOpenEventsToCheck: jest.fn().mockResolvedValue([]),
            markChecked: jest.fn().mockResolvedValue(undefined),
            insert: jest.fn().mockResolvedValue(true),
            resolve: jest.fn().mockResolvedValue(1),
        };
        sourceRepository = {
            listPendingReferenceIds: jest.fn().mockResolvedValue({ referenceIds: [], hasMore: false }),
            isStillPending: jest.fn().mockResolvedValue(true),
        };
        logger = { logSuccess: jest.fn(), logWarning: jest.fn(), logError: jest.fn() };
    });

    it('이벤트가 유실돼 큐에 없는 대기 건을 뒤늦게 채운다', async () => {
        // 적재 실패나 프로세스 종료로 알림이 통째로 사라진 경우의 복구 경로
        sourceRepository.listPendingReferenceIds.mockImplementation((kind: string) =>
            Promise.resolve(
                kind === OPS_PENDING_KIND.BREEDER_VERIFICATION
                    ? { referenceIds: ['breeder-1'], lastScannedId: 'breeder-1', hasMore: false }
                    : { referenceIds: [], hasMore: false },
            ),
        );

        const result = await buildUseCase().execute(now);

        expect(result.recovered).toBe(1);
        expect(eventRepository.insert).toHaveBeenCalledWith(
            expect.objectContaining({
                kind: OPS_PENDING_KIND.BREEDER_VERIFICATION,
                referenceId: 'breeder-1',
                adminPath: '/breeders/verification',
            }),
        );
    });

    it('이미 큐에 열려 있는 건은 다시 만들지 않는다', async () => {
        sourceRepository.listPendingReferenceIds.mockImplementation((kind: string) =>
            Promise.resolve(
                kind === OPS_PENDING_KIND.BREEDER_VERIFICATION
                    ? { referenceIds: ['breeder-1'], lastScannedId: 'breeder-1', hasMore: false }
                    : { referenceIds: [], hasMore: false },
            ),
        );
        eventRepository.findOpenReferenceIds.mockResolvedValue(['breeder-1']);

        const result = await buildUseCase().execute(now);

        expect(result.recovered).toBe(0);
        expect(eventRepository.insert).not.toHaveBeenCalled();
    });

    it('원본이 이미 처리된 건은 닫아 리마인드를 멈춘다', async () => {
        // 처리 완료 이벤트가 유실돼 유령 독촉이 계속되는 경우의 복구 경로
        eventRepository.findOpenEventsToCheck.mockResolvedValue([
            { eventId: 'evt-1', kind: OPS_PENDING_KIND.BREEDER_REPORT, referenceId: 'report-1' },
        ]);
        sourceRepository.isStillPending.mockResolvedValue(false);

        const result = await buildUseCase().execute(now);

        expect(result.closed).toBe(1);
        // 자기 환경의 건만 닫는다 (로컬과 dev 가 같은 DB 를 쓴다)
        expect(eventRepository.resolve).toHaveBeenCalledWith(
            'production',
            OPS_PENDING_KIND.BREEDER_REPORT,
            'report-1',
            '처리 확인됨',
            expect.any(Date),
        );
    });

    it('확인한 건에 확인 시각을 남겨 다음 주기에는 다른 건을 본다', async () => {
        // 항상 같은 앞자리만 보면 뒤쪽 건들이 영영 검사되지 않는다
        eventRepository.findOpenEventsToCheck.mockResolvedValue([
            { eventId: 'evt-1', kind: OPS_PENDING_KIND.BREEDER_REPORT, referenceId: 'report-1' },
            { eventId: 'evt-2', kind: OPS_PENDING_KIND.BREEDER_REPORT, referenceId: 'report-2' },
        ]);

        await buildUseCase().execute(now);

        expect(eventRepository.markChecked).toHaveBeenCalledWith(['evt-1', 'evt-2'], now);
    });

    it('대기 건이 한도를 넘으면 다음 주기에 그 뒤부터 이어서 본다', async () => {
        sourceRepository.listPendingReferenceIds.mockResolvedValue({
            referenceIds: ['ref-1'],
            lastScannedId: 'ref-1',
            hasMore: true,
        });

        const useCase = buildUseCase();
        await useCase.execute(now);
        sourceRepository.listPendingReferenceIds.mockClear();
        sourceRepository.listPendingReferenceIds.mockResolvedValue({ referenceIds: [], hasMore: false });

        await useCase.execute(now);

        // 두 번째 주기는 첫 주기가 멈춘 지점부터 시작한다
        expect(sourceRepository.listPendingReferenceIds).toHaveBeenCalledWith(expect.any(String), now, 'ref-1');
    });

    it('아직 처리 전인 건은 닫지 않는다', async () => {
        eventRepository.findOpenEventsToCheck.mockResolvedValue([
            { eventId: 'evt-1', kind: OPS_PENDING_KIND.BREEDER_REPORT, referenceId: 'report-1' },
        ]);
        sourceRepository.isStillPending.mockResolvedValue(true);

        const result = await buildUseCase().execute(now);

        expect(result.closed).toBe(0);
        expect(eventRepository.resolve).not.toHaveBeenCalled();
    });
});
