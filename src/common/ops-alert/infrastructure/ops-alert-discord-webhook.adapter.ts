import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { OPS_PENDING_KIND } from '../../events/ops-pending.event';
import type { OpsAlertWebhookPort } from '../application/ports/ops-alert-webhook.port';

/**
 * 운영 알림 디스코드 Webhook Adapter.
 *
 * 종류마다 방이 다르므로 종류 -> 환경변수 키로 매핑한다.
 * 운영/개발 서버는 각자의 .env 에 자기 방 웹훅을 갖고, 개발자 PC(local)는 아무 방도 갖지 않는다.
 */
@Injectable()
export class OpsAlertDiscordWebhookAdapter implements OpsAlertWebhookPort {
    /** 알림을 보내는 환경. 그 외(local, test)는 전송 대상이 아니다 */
    private static readonly ALERT_ENVIRONMENTS = ['production', 'development'];

    private static readonly WEBHOOK_KEY_BY_KIND: Record<string, string> = {
        [OPS_PENDING_KIND.ADOPTION_APPLICATION]: 'DISCORD_OPS_ADOPTION_APPLICATION_WEBHOOK_URL',
        [OPS_PENDING_KIND.BREEDER_VERIFICATION]: 'DISCORD_OPS_BREEDER_VERIFICATION_WEBHOOK_URL',
        [OPS_PENDING_KIND.BREEDER_REPORT]: 'DISCORD_OPS_BREEDER_REPORT_WEBHOOK_URL',
        [OPS_PENDING_KIND.REVIEW_REPORT]: 'DISCORD_OPS_REVIEW_REPORT_WEBHOOK_URL',
        [OPS_PENDING_KIND.COMMUNITY_REPORT]: 'DISCORD_OPS_COMMUNITY_REPORT_WEBHOOK_URL',
        [OPS_PENDING_KIND.INQUIRY]: 'DISCORD_OPS_INQUIRY_WEBHOOK_URL',
    };

    constructor(private readonly configService: ConfigService) {}

    isEnabled(kind: string): boolean {
        return this.resolveWebhookUrl(kind).length > 0;
    }

    async send(kind: string, payload: Record<string, unknown>): Promise<void> {
        const url = this.resolveWebhookUrl(kind);
        if (!url) {
            throw new Error('ops_alert_webhook_not_configured');
        }

        await axios.post(url, payload, { timeout: 8_000, maxRedirects: 0 });
    }

    /** 알림 환경이면서 방이 설정된 경우에만 URL 을 돌려준다 */
    private resolveWebhookUrl(kind: string): string {
        const environment =
            this.configService.get<string>('APP_ENV') || this.configService.get<string>('NODE_ENV') || 'development';
        if (!OpsAlertDiscordWebhookAdapter.ALERT_ENVIRONMENTS.includes(environment)) {
            return '';
        }

        const key = OpsAlertDiscordWebhookAdapter.WEBHOOK_KEY_BY_KIND[kind];
        return (key && this.configService.get<string>(key)) || '';
    }
}
