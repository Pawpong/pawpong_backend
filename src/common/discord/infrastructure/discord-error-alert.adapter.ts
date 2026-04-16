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

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {
        this.errorWebhookUrl =
            this.configService.get<string>('DISCORD_ERROR_WEBHOOK_URL') ||
            this.configService.get<string>('DISCORD_WEBHOOK_URL') ||
            '';

        if (!this.errorWebhookUrl) {
            this.logger.logWarning('DiscordErrorAlertAdapter', '디스코드 에러 웹훅 URL이 설정되지 않았습니다.');
        }
    }

    /**
     * Critical 에러 알림을 Discord Webhook으로 전송합니다.
     */
    async sendCriticalErrorAlert(request: DiscordErrorAlertRequest): Promise<void> {
        if (!this.errorWebhookUrl) {
            this.logger.logWarning(
                'sendCriticalErrorAlert',
                '디스코드 에러 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.',
            );
            return;
        }

        const timestamp = request.timestamp ?? new Date();
        const title = request.severity === 'critical' ? '🚨 Critical 서버 에러' : '⚠️ 서버 에러';
        const fields = this.buildFields(request);

        await axios.post(this.errorWebhookUrl, {
            embeds: [
                {
                    title,
                    color: request.severity === 'critical' ? 0xf44336 : 0xff9800,
                    description: this.truncate(request.message, 3500),
                    fields,
                    timestamp: timestamp.toISOString(),
                    footer: {
                        text: 'Pawpong Backend - Error Monitor',
                    },
                },
            ],
        });

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
                value: this.truncate(`${request.method ?? '-'} ${request.path ?? '-'}`, 1024),
                inline: false,
            });
        }
        if (request.userId) {
            fields.push({ name: 'User ID', value: request.userId, inline: true });
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
        if (value.length <= maxLength) {
            return value;
        }

        return `${value.slice(0, maxLength - 3)}...`;
    }
}
