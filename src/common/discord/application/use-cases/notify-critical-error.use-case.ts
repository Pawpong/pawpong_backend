import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../logger/custom-logger.service';
import { DISCORD_ERROR_ALERT_PORT } from '../ports/discord-error-alert.port';
import type { DiscordErrorAlertPort, DiscordErrorAlertRequest } from '../ports/discord-error-alert.port';
import { DiscordErrorAlertPolicyService } from '../../domain/services/discord-error-alert-policy.service';

export type NotifyCriticalErrorResult = {
    sent: boolean;
    reason?: 'filtered' | 'cooldown' | 'failed';
};

/**
 * Critical 에러 Discord 알림 Use Case
 *
 * 필터링, 중복 방지, 외부 알림 발송 오케스트레이션만 담당합니다.
 */
@Injectable()
export class NotifyCriticalErrorUseCase {
    private readonly recentAlertMap = new Map<string, number>();

    constructor(
        private readonly policyService: DiscordErrorAlertPolicyService,
        @Inject(DISCORD_ERROR_ALERT_PORT)
        private readonly errorAlertPort: DiscordErrorAlertPort,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 운영자가 즉시 알아야 하는 에러를 Discord로 알립니다.
     */
    async execute(request: DiscordErrorAlertRequest, now: Date = new Date()): Promise<NotifyCriticalErrorResult> {
        if (!this.policyService.shouldNotify(request)) {
            return { sent: false, reason: 'filtered' };
        }

        const deduplicationKey = this.policyService.buildDeduplicationKey(request);
        const lastSentAt = this.recentAlertMap.get(deduplicationKey);
        const nowTime = now.getTime();

        if (lastSentAt && nowTime - lastSentAt < this.policyService.getCooldownMs()) {
            return { sent: false, reason: 'cooldown' };
        }

        try {
            await this.errorAlertPort.sendCriticalErrorAlert({
                ...request,
                timestamp: request.timestamp ?? now,
            });
            this.recentAlertMap.set(deduplicationKey, nowTime);
            this.cleanupExpiredAlerts(nowTime);
            return { sent: true };
        } catch (error) {
            this.logger.logError('NotifyCriticalErrorUseCase', 'Discord critical 에러 알림 실패', error);
            return { sent: false, reason: 'failed' };
        }
    }

    /**
     * 오래된 중복 방지 키를 정리하여 메모리 증가를 제한합니다.
     */
    private cleanupExpiredAlerts(nowTime: number): void {
        const cooldownMs = this.policyService.getCooldownMs();

        for (const [key, sentAt] of this.recentAlertMap.entries()) {
            if (nowTime - sentAt >= cooldownMs) {
                this.recentAlertMap.delete(key);
            }
        }
    }
}
