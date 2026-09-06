import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CustomLoggerService } from '../../../logger/custom-logger.service';
import { DISCORD_ERROR_ALERT_PORT } from '../ports/discord-error-alert.port';
import type { DiscordErrorAlertPort, DiscordErrorAlertRequest } from '../ports/discord-error-alert.port';
import { DiscordErrorAlertPolicyService } from '../../domain/services/discord-error-alert-policy.service';
export type NotifyCriticalErrorResult = { sent: boolean; reason?: 'filtered' | 'cooldown' | 'failed' };
type Group = {
    request: DiscordErrorAlertRequest;
    firstAt: number;
    lastAt: number;
    sentAt: number;
    count: number;
    pending: number;
    busy: boolean;
};

/** 첫 오류는 즉시 보내고 이후 같은 오류는 5분 단위 발생 건수로 요약한다. */
@Injectable()
export class NotifyCriticalErrorUseCase implements OnModuleInit, OnModuleDestroy {
    private readonly groups = new Map<string, Group>();
    private timer?: ReturnType<typeof setInterval>;
    constructor(
        private readonly policyService: DiscordErrorAlertPolicyService,
        @Inject(DISCORD_ERROR_ALERT_PORT) private readonly errorAlertPort: DiscordErrorAlertPort,
        private readonly logger: CustomLoggerService,
    ) {}
    /** 추가 요청이 없어도 누적 오류를 전달한다. */
    onModuleInit() {
        this.timer = setInterval(() => {
            void this.flush();
        }, 60_000);
        this.timer.unref();
    }
    /** 종료 시 주기 작업을 정리한다. */
    onModuleDestroy() {
        if (this.timer) clearInterval(this.timer);
    }
    /** 환경별 채널 정책을 적용한 뒤 같은 오류의 동시 전송도 한 번으로 제한한다. */
    async execute(request: DiscordErrorAlertRequest, now = new Date()): Promise<NotifyCriticalErrorResult> {
        const environment = process.env.APP_ENV || process.env.NODE_ENV || 'development';
        if (environment !== 'production' && !process.env.DISCORD_DEV_ERROR_WEBHOOK_URL)
            return { sent: false, reason: 'filtered' };
        if (!this.policyService.shouldNotify(request)) return { sent: false, reason: 'filtered' };
        const key = environment + '|' + this.policyService.buildDeduplicationKey(request);
        let group = this.groups.get(key);
        if (!group) {
            // 비정상적으로 많은 종류의 오류가 들어와도 프로세스 메모리를 제한한다.
            if (this.groups.size >= 1000) return { sent: false, reason: 'cooldown' };
            group = {
                request,
                firstAt: now.getTime(),
                lastAt: now.getTime(),
                sentAt: 0,
                count: 0,
                pending: 0,
                busy: false,
            };
            this.groups.set(key, group);
        }
        group.count++;
        group.pending++;
        group.lastAt = now.getTime();
        if (group.busy || (group.sentAt && now.getTime() - group.sentAt < this.policyService.getCooldownMs()))
            return { sent: false, reason: 'cooldown' };
        return this.send(group, now);
    }
    /** 억제된 발생 건수를 주기적으로 요약하고 오래된 그룹을 회수한다. */
    async flush(now = new Date()): Promise<void> {
        for (const [key, group] of this.groups) {
            if (group.busy) continue;
            if (group.pending && now.getTime() - group.sentAt >= this.policyService.getCooldownMs())
                await this.send(group, now);
            if (!group.pending && now.getTime() - group.lastAt > 3_600_000) this.groups.delete(key);
        }
    }
    private async send(group: Group, now: Date): Promise<NotifyCriticalErrorResult> {
        group.busy = true;
        const pending = group.pending;
        try {
            await this.errorAlertPort.sendCriticalErrorAlert({
                ...group.request,
                timestamp: now,
                metadata: {
                    occurrences: pending,
                    totalOccurrences: group.count,
                    firstSeen: new Date(group.firstAt).toISOString(),
                    lastSeen: new Date(group.lastAt).toISOString(),
                    summary: group.sentAt > 0,
                },
            });
            group.pending -= pending;
            group.sentAt = now.getTime();
            return { sent: true };
        } catch {
            // Axios 요청 구성에 포함된 웹후크 토큰과 원문을 로그에 노출하지 않는다.
            this.logger.logError(
                'notifyCriticalError',
                'Discord 오류 알림 전달 실패',
                new Error('discord_delivery_failed'),
            );
            group.sentAt = now.getTime();
            return { sent: false, reason: 'failed' };
        } finally {
            group.busy = false;
        }
    }
}
