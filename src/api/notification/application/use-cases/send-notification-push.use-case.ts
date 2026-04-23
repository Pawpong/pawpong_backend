import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import {
    NOTIFICATION_PUSH_PORT,
    type NotificationPushMessage,
    type NotificationPushPort,
} from '../ports/notification-push.port';
import {
    NOTIFICATION_PUSH_TOKEN_STORE_PORT,
    type NotificationPushTokenStorePort,
} from '../ports/notification-push-token-store.port';
import type { NotificationUserRole } from '../ports/notification-command.port';

export interface SendNotificationPushCommand {
    userId: string;
    userRole: NotificationUserRole;
    message: NotificationPushMessage;
}

/**
 * 사용자의 등록된 디바이스 토큰 전부에 푸시를 발송하고
 * FCM이 무효 판정한 토큰은 DB에서 정리합니다.
 *
 * fire-and-forget 방식으로 호출되며, 내부적으로 실패 토큰을 정리하므로
 * 호출 측은 결과를 기다릴 필요가 없습니다.
 */
@Injectable()
export class SendNotificationPushUseCase {
    constructor(
        @Inject(NOTIFICATION_PUSH_PORT)
        private readonly notificationPushPort: NotificationPushPort,
        @Inject(NOTIFICATION_PUSH_TOKEN_STORE_PORT)
        private readonly pushTokenStore: NotificationPushTokenStorePort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(command: SendNotificationPushCommand): Promise<void> {
        const { userId, userRole, message } = command;

        try {
            const ownerTokens = await this.pushTokenStore.findTokensByUser(userId, userRole);
            if (ownerTokens.tokens.length === 0) {
                return;
            }

            const results = await this.notificationPushPort.sendToTokens(ownerTokens.tokens, message);
            const invalidTokens = results.filter((entry) => entry.invalidToken).map((entry) => entry.token);

            if (invalidTokens.length > 0) {
                await this.pushTokenStore.purgeInvalidTokens(userId, userRole, invalidTokens);
                this.logger.logWarning('sendNotificationPush', '무효 푸시 토큰 제거', {
                    userId,
                    invalidCount: invalidTokens.length,
                });
            }
        } catch (error) {
            this.logger.logError('sendNotificationPush', '푸시 발송 실패', error);
        }
    }
}
