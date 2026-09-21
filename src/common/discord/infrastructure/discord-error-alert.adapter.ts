import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { CustomLoggerService } from '../../logger/custom-logger.service';
import type { DiscordErrorAlertPort, DiscordErrorAlertRequest } from '../application/ports/discord-error-alert.port';

/**
 * Discord Webhook 에러 알림 Adapter
 *
 * Discord Webhook HTTP API 호출 책임만 담당합니다.
 */
@Injectable()
export class DiscordErrorAlertAdapter implements DiscordErrorAlertPort {
    private readonly errorWebhookUrl: string;
    private readonly environment: string;

    /**
     * 환경별 에러 웹훅 키.
     * 배포된 환경만 값을 가진다. 개발자 PC(local)는 대상이 아니라서 어느 방으로도 보내지 않는다.
     */
    private static readonly ERROR_WEBHOOK_KEY_BY_ENVIRONMENT: Record<string, string> = {
        production: 'DISCORD_ERROR_WEBHOOK_URL',
        development: 'DISCORD_DEV_ERROR_WEBHOOK_URL',
    };

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {
        this.environment =
            this.configService.get<string>('APP_ENV') || this.configService.get<string>('NODE_ENV') || 'development';
        const webhookKey = DiscordErrorAlertAdapter.ERROR_WEBHOOK_KEY_BY_ENVIRONMENT[this.environment];
        this.errorWebhookUrl = webhookKey ? this.configService.get<string>(webhookKey) || '' : '';

        // 로컬(APP_ENV=local)은 알림 대상이 아니므로 경고 없이 조용히 끈다.
        // 개발 서버 오류 방에 개발자 PC 로그가 섞이면 실제 dev 장애를 못 알아본다.
        if (!this.errorWebhookUrl && webhookKey) {
            this.logger.logWarning('DiscordErrorAlertAdapter', '디스코드 에러 웹훅 URL이 설정되지 않았습니다.');
        }
    }

    /**
     * 알림을 보낼 방이 정해진 환경인지 반환합니다.
     */
    isAlertEnabled(): boolean {
        return this.errorWebhookUrl.length > 0;
    }

    /**
     * Critical 에러 알림을 Discord Webhook으로 전송합니다.
     */
    async sendCriticalErrorAlert(request: DiscordErrorAlertRequest): Promise<void> {
        if (!this.errorWebhookUrl) {
            // 알림 대상이 아닌 환경(local 등)은 설정 누락이 아니므로 경고도 남기지 않는다.
            if (DiscordErrorAlertAdapter.ERROR_WEBHOOK_KEY_BY_ENVIRONMENT[this.environment]) {
                this.logger.logWarning(
                    'sendCriticalErrorAlert',
                    '디스코드 에러 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.',
                );
            }
            throw new Error('discord_error_webhook_not_configured');
        }

        const timestamp = request.timestamp ?? new Date();
        const title = request.severity === 'critical' ? '🚨 Critical 서버 에러' : '⚠️ 서버 에러';
        const fields = this.buildFields(request);

        await axios.post(
            this.errorWebhookUrl,
            {
                allowed_mentions: { parse: [] },
                embeds: [
                    {
                        title: `[${this.environment}] ${title}`,
                        color: request.severity === 'critical' ? 0xf44336 : 0xff9800,
                        description: this.truncate(request.message, 3500),
                        fields,
                        timestamp: timestamp.toISOString(),
                        footer: {
                            text: 'Pawpong Backend - Error Monitor',
                        },
                    },
                ],
            },
            { timeout: 8000, maxRedirects: 0 },
        );

        this.logger.logSuccess('sendCriticalErrorAlert', 'Discord critical 에러 알림 전송 완료', {
            context: request.context,
            statusCode: request.statusCode,
            path: request.path,
        });
    }

    /**
     * Discord embed field 목록을 생성합니다.
     */
    private buildFields(request: DiscordErrorAlertRequest): Array<{ name: string; value: string; inline: boolean }> {
        const fields: Array<{ name: string; value: string; inline: boolean }> = [
            { name: 'Context', value: request.context, inline: true },
            { name: 'Severity', value: request.severity, inline: true },
        ];

        if (request.statusCode) {
            fields.push({ name: 'Status', value: String(request.statusCode), inline: true });
        }
        if (request.method || request.path) {
            fields.push({
                name: 'Request',
                value: this.truncate(`${request.method ?? '-'} ${(request.path ?? '-').split('?')[0]}`, 1024),
                inline: false,
            });
        }

        if (request.metadata && Object.keys(request.metadata).length > 0) {
            fields.push({
                name: 'Metadata',
                value: this.truncate(JSON.stringify(request.metadata), 1024),
                inline: false,
            });
        }
        if (request.stack) {
            fields.push({
                name: 'Stack',
                value: `\`\`\`\n${this.truncate(request.stack, 950)}\n\`\`\``,
                inline: false,
            });
        }

        return fields;
    }

    /**
     * Discord embed 길이 제한에 맞춰 문자열을 자릅니다.
     */
    private truncate(value: string, maxLength: number): string {
        value = value
            .replace(/https?:\/\/[^\s]+/g, '[URL]')
            .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email]')
            .replace(/(?:bearer\s+|sk-)[a-z0-9_.-]+/gi, '[secret]');
        if (value.length <= maxLength) {
            return value;
        }

        return `${value.slice(0, maxLength - 3)}...`;
    }
}
