import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CustomLoggerService } from '../logger/custom-logger.service';
import { DiscordWebhookService } from './discord-webhook.service';

/**
 * 디스코드 웹훅 모듈
 *
 * 디스코드로 실시간 알림을 전송하는 기능을 제공합니다.
 */
@Module({
    imports: [ConfigModule],
    providers: [DiscordWebhookService, CustomLoggerService],
    exports: [DiscordWebhookService],
})
export class DiscordWebhookModule {}
