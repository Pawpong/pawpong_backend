import { ConfigService } from '@nestjs/config';

import { CustomLoggerService } from '../../../logger/custom-logger.service';
import { OPS_PENDING_KIND } from '../../../events/ops-pending.event';
import { OpsAlertPresenterService } from '../../domain/services/ops-alert-presenter.service';
import { OpsAlertReminderPolicyService } from '../../domain/services/ops-alert-reminder-policy.service';
import { OpsAlertDiscordWorker } from '../../infrastructure/ops-alert-discord.worker';

describe('OpsAlertDiscordWorker', () => {
    const now = new Date('2026-09-20T00:00:00.000Z');

    const baseEvent = {
        eventId: 'evt-1',
        kind: OPS_PENDING_KIND.BREEDER_VERIFICATION,
        referenceId: 'breeder-1',
        summary: '인증 심사 대기',
        details: [],
        adminPath: '/breeders/verification',
        environment: 'production',
        remindCount: 0,
        attempts: 1,
        createdAt: new Date('2026-09-19T12:00:00.000Z'),
    };

    let repository: {
        claimForDelivery: jest.Mock;
        claimForReminder: jest.Mock;
        markDelivered: jest.Mock;
        markReminded: jest.Mock;
        retryDelivery: jest.Mock;
        retryReminder: jest.Mock;
    };
    let webhook: { isEnabled: jest.Mock; send: jest.Mock };
    let reconcile: { execute: jest.Mock };
    let logger: { logWarning: jest.Mock; logSuccess: jest.Mock };

    const buildWorker = () =>
        new OpsAlertDiscordWorker(
            repository as never,
            new OpsAlertPresenterService(),
            new OpsAlertReminderPolicyService(),
            reconcile as never,
            webhook,
            {
                get: (key: string) => (key === 'APP_ENV' ? 'production' : undefined),
            } as ConfigService,
            logger as unknown as CustomLoggerService,
        );

    beforeEach(() => {
        repository = {
            claimForDelivery: jest.fn().mockResolvedValue(null),
            claimForReminder: jest.fn().mockResolvedValue(null),
            markDelivered: jest.fn().mockResolvedValue(undefined),
            markReminded: jest.fn().mockResolvedValue(undefined),
            retryDelivery: jest.fn().mockResolvedValue(undefined),
            retryReminder: jest.fn().mockResolvedValue(undefined),
        };
        webhook = { isEnabled: jest.fn().mockReturnValue(true), send: jest.fn().mockResolvedValue(undefined) };
        reconcile = { execute: jest.fn().mockResolvedValue({ recovered: 0, closed: 0 }) };
        logger = { logWarning: jest.fn(), logSuccess: jest.fn() };
    });

    it('대기 중인 접수를 보내고 첫 리마인드 시각을 6시간 뒤로 잡는다', async () => {
        repository.claimForDelivery.mockResolvedValueOnce(baseEvent);

        await buildWorker().tick(now);

        expect(webhook.send).toHaveBeenCalledWith(OPS_PENDING_KIND.BREEDER_VERIFICATION, expect.any(Object));
        expect(repository.markDelivered).toHaveBeenCalledWith(
            'evt-1',
            expect.any(String),
            now,
            new Date('2026-09-20T06:00:00.000Z'),
        );
    });

    it('보낼 방이 없으면 전송하지 않고 큐에 그대로 둔다', async () => {
        // 로컬처럼 방이 없는 환경에서 접수가 사라지면 배포 후 확인할 방법이 없다
        repository.claimForDelivery.mockResolvedValueOnce(baseEvent);
        webhook.isEnabled.mockReturnValue(false);

        await buildWorker().tick(now);

        expect(webhook.send).not.toHaveBeenCalled();
        expect(repository.markDelivered).not.toHaveBeenCalled();
        expect(repository.retryDelivery).toHaveBeenCalled();
    });

    it('전송에 실패하면 재시도로 넘기고 전달 처리하지 않는다', async () => {
        repository.claimForDelivery.mockResolvedValueOnce(baseEvent);
        webhook.send.mockRejectedValueOnce(new Error('discord down'));

        await buildWorker().tick(now);

        expect(repository.markDelivered).not.toHaveBeenCalled();
        expect(repository.retryDelivery).toHaveBeenCalledWith('evt-1', expect.any(String), 1);
    });

    it('미처리 건에 리마인드를 보내고 다음 시각을 잡는다', async () => {
        repository.claimForReminder.mockResolvedValueOnce({ ...baseEvent, remindCount: 1 });

        await buildWorker().tick(now);

        expect(repository.markReminded).toHaveBeenCalledWith(
            'evt-1',
            expect.any(String),
            new Date('2026-09-20T06:00:00.000Z'),
        );
    });

    it('재동기화가 실패해도 전송은 계속한다', async () => {
        // 재동기화는 보조 장치다. 여기서 막히면 정작 알림이 안 나간다
        reconcile.execute.mockRejectedValueOnce(new Error('db down'));
        repository.claimForDelivery.mockResolvedValueOnce(baseEvent);

        await buildWorker().tick(now);

        expect(webhook.send).toHaveBeenCalled();
        expect(logger.logWarning).toHaveBeenCalled();
    });

    it('첫 주기에는 도메인 상태와 큐를 다시 맞춘다', async () => {
        await buildWorker().tick(now);

        expect(reconcile.execute).toHaveBeenCalledWith(now);
    });

    it('마지막 리마인드 뒤에는 다음 예정을 비운다', async () => {
        repository.claimForReminder.mockResolvedValueOnce({ ...baseEvent, remindCount: 3 });

        await buildWorker().tick(now);

        expect(repository.markReminded).toHaveBeenCalledWith('evt-1', expect.any(String), undefined);
    });
});
