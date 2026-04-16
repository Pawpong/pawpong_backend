import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CustomLoggerService } from '../logger/custom-logger.service';
import { DISCORD_ERROR_ALERT_PORT } from './application/ports/discord-error-alert.port';
import { NotifyCriticalErrorUseCase } from './application/use-cases/notify-critical-error.use-case';
import { DiscordWebhookService } from './discord-webhook.service';
import { DiscordErrorAlertPolicyService } from './domain/services/discord-error-alert-policy.service';
import { DiscordErrorAlertAdapter } from './infrastructure/discord-error-alert.adapter';

/**
 * 디스코드 웹훅 모듈
 *
 * 디스코드로 실시간 알림을 전송하는 기능을 제공합니다.
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        DiscordWebhookService,
        DiscordErrorAlertPolicyService,
        NotifyCriticalErrorUseCase,
        {
            provide: DISCORD_ERROR_ALERT_PORT,
            useClass: DiscordErrorAlertAdapter,
        },
        CustomLoggerService,
    ],
    exports: [DiscordWebhookService, NotifyCriticalErrorUseCase],
})
export class DiscordWebhookModule {}
