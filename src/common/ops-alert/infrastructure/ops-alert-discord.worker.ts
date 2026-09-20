import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { CustomLoggerService } from '../../logger/custom-logger.service';
import { OPS_ALERT_WEBHOOK_PORT, type OpsAlertWebhookPort } from '../application/ports/ops-alert-webhook.port';
import type { OpsPendingEventSnapshot } from '../application/types/ops-alert.type';
import { OpsAlertPresenterService } from '../domain/services/ops-alert-presenter.service';
import { OpsAlertReminderPolicyService } from '../domain/services/ops-alert-reminder-policy.service';
import { ReconcileOpsPendingUseCase } from '../application/use-cases/reconcile-ops-pending.use-case';
import { OpsPendingEventRepository } from '../repository/ops-pending-event.repository';

/**
 * 운영 알림 전송 워커.
 *
 * 한 주기에 두 가지를 한다.
 * 1) 아직 안 보낸 접수를 종류별 디스코드 방으로 보낸다
 * 2) 처리되지 않은 채 예정 시각이 지난 건에 리마인드를 보낸다
 *
 * DB 를 큐로 쓰므로 재시작이나 웹훅 장애에도 접수가 유실되지 않는다.
 */
@Injectable()
export class OpsAlertDiscordWorker implements OnModuleInit, OnModuleDestroy {
    /** 한 주기에 처리할 최대 건수 — 밀린 알림이 한 번에 쏟아지지 않게 제한한다 */
    private static readonly BATCH_SIZE = 10;
    private static readonly TICK_MS = 15_000;
    /** 알림을 보내는 환경. 개발자 PC(local)에서는 큐를 아예 돌리지 않는다 */
    private static readonly ALERT_ENVIRONMENTS = ['production', 'development'];
    /** 도메인 상태와 큐를 다시 맞추는 주기 (5분) */
    private static readonly RECONCILE_INTERVAL_MS = 5 * 60 * 1000;

    private timer?: ReturnType<typeof setInterval>;
    private running = false;
    private lastReconciledAt = 0;

    constructor(
        private readonly repository: OpsPendingEventRepository,
        private readonly presenter: OpsAlertPresenterService,
        private readonly reminderPolicy: OpsAlertReminderPolicyService,
        private readonly reconcileOpsPendingUseCase: ReconcileOpsPendingUseCase,
        @Inject(OPS_ALERT_WEBHOOK_PORT)
        private readonly webhook: OpsAlertWebhookPort,
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {}

    onModuleInit() {
        this.timer = setInterval(() => {
            void this.tick();
        }, OpsAlertDiscordWorker.TICK_MS);
        this.timer.unref();
        void this.tick();
    }

    onModuleDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    /** 최초 전송 + 리마인드를 한 번씩 훑는다 */
    async tick(now = new Date()): Promise<void> {
        if (this.running) return;
        // 보낼 방이 없는 환경에서 15초마다 DB 를 긁을 이유가 없다
        if (!OpsAlertDiscordWorker.ALERT_ENVIRONMENTS.includes(this.getEnvironment())) return;
        this.running = true;
        try {
            await this.reconcileIfDue(now);
            await this.deliverPending(now);
            await this.sendReminders(now);
        } catch {
            // 개별 전송 실패는 아래에서 이미 처리한다. 여기 오는 건 DB 접근 실패다.
            this.logger.logWarning('opsAlertWorker', '운영 알림 큐를 읽지 못했습니다.');
        } finally {
            this.running = false;
        }
    }

    /**
     * 주기적으로 도메인 상태와 큐를 다시 맞춘다.
     *
     * 이벤트 유실로 큐에 없는 대기 건을 채우고, 이미 처리된 건의 리마인드를 멈춘다.
     * 재동기화가 실패해도 전송은 계속되어야 하므로 여기서 예외를 삼킨다.
     */
    private async reconcileIfDue(now: Date): Promise<void> {
        if (now.getTime() - this.lastReconciledAt < OpsAlertDiscordWorker.RECONCILE_INTERVAL_MS) return;
        this.lastReconciledAt = now.getTime();

        try {
            await this.reconcileOpsPendingUseCase.execute(now);
        } catch {
            this.logger.logWarning('opsAlertWorker', '운영 알림 큐 재동기화 실패 - 다음 주기에 다시 시도합니다.');
        }
    }

    /** 접수 직후 첫 알림 */
    private async deliverPending(now: Date): Promise<void> {
        const environment = this.getEnvironment();

        for (let i = 0; i < OpsAlertDiscordWorker.BATCH_SIZE; i++) {
            const leaseToken = randomUUID();
            const event = await this.repository.claimForDelivery(environment, leaseToken);
            if (!event) break;

            // 보낼 방이 없는 환경(local)은 전송 실패가 아니라 대상 아님이다. 큐에 그대로 둔다.
            if (!this.webhook.isEnabled(event.kind)) {
                await this.repository.retryDelivery(event.eventId, leaseToken, event.attempts);
                continue;
            }

            try {
                await this.webhook.send(
                    event.kind,
                    this.presenter.buildPayload({
                        event: this.toSnapshot(event),
                        adminUrl: this.getAdminUrl(),
                    }),
                );
                await this.repository.markDelivered(
                    event.eventId,
                    leaseToken,
                    now,
                    this.reminderPolicy.getFirstRemindAt(now),
                );
            } catch {
                // 웹훅 URL 과 요청 본문이 로그에 남지 않도록 원본 오류는 출력하지 않는다.
                this.logger.logWarning('opsAlertWorker', `운영 알림 전송 실패 - 재시도 예약 (${event.kind})`);
                await this.repository.retryDelivery(event.eventId, leaseToken, event.attempts);
            }
        }
    }

    /** 처리되지 않은 건 독촉 */
    private async sendReminders(now: Date): Promise<void> {
        const environment = this.getEnvironment();

        for (let i = 0; i < OpsAlertDiscordWorker.BATCH_SIZE; i++) {
            const leaseToken = randomUUID();
            const event = await this.repository.claimForReminder(environment, leaseToken, now);
            if (!event) break;

            if (!this.webhook.isEnabled(event.kind)) {
                await this.repository.retryReminder(event.eventId, leaseToken, new Date(now.getTime() + 600_000));
                continue;
            }

            const remindCount = event.remindCount + 1;
            try {
                await this.webhook.send(
                    event.kind,
                    this.presenter.buildPayload({
                        event: this.toSnapshot(event),
                        adminUrl: this.getAdminUrl(),
                        reminder: {
                            count: remindCount,
                            maxCount: this.reminderPolicy.getMaxRemindCount(),
                            elapsed: this.reminderPolicy.describeElapsed(event.createdAt, now),
                        },
                    }),
                );
                await this.repository.markReminded(
                    event.eventId,
                    leaseToken,
                    this.reminderPolicy.getNextRemindAt(now, remindCount),
                );
            } catch {
                this.logger.logWarning('opsAlertWorker', `운영 알림 리마인드 실패 - 재시도 예약 (${event.kind})`);
                await this.repository.retryReminder(event.eventId, leaseToken, new Date(now.getTime() + 600_000));
            }
        }
    }

    private toSnapshot(event: {
        eventId: string;
        kind: string;
        referenceId: string;
        summary: string;
        details: Array<{ name: string; value: string }>;
        adminPath: string;
        environment: string;
        remindCount: number;
        createdAt: Date;
    }): OpsPendingEventSnapshot {
        return {
            eventId: event.eventId,
            kind: event.kind,
            referenceId: event.referenceId,
            summary: event.summary,
            details: event.details ?? [],
            adminPath: event.adminPath,
            environment: event.environment,
            remindCount: event.remindCount,
            createdAt: event.createdAt,
        };
    }

    private getEnvironment(): string {
        return this.configService.get<string>('APP_ENV') || this.configService.get<string>('NODE_ENV') || 'development';
    }

    private getAdminUrl(): string {
        return this.configService.get<string>('ADMIN_URL') || 'https://admin.pawpong.kr';
    }
}
