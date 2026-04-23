import { BadRequestException, HttpException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import {
    NOTIFICATION_PUSH_TOKEN_STORE_PORT,
    type NotificationPushTokenStorePort,
    type UnregisterPushDeviceTokenCommand,
} from '../ports/notification-push-token-store.port';

/**
 * 디바이스 푸시 토큰을 사용자 계정에서 제거합니다 (로그아웃, 알림 거부, 앱 삭제 전 등).
 */
@Injectable()
export class UnregisterPushDeviceTokenUseCase {
    constructor(
        @Inject(NOTIFICATION_PUSH_TOKEN_STORE_PORT)
        private readonly pushTokenStore: NotificationPushTokenStorePort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(command: UnregisterPushDeviceTokenCommand): Promise<void> {
        this.logger.logStart('unregisterPushToken', '디바이스 푸시 토큰 해제 시작', {
            userId: command.userId,
            userRole: command.userRole,
        });

        if (!command.userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }
        if (!command.token) {
            throw new BadRequestException('푸시 토큰이 필요합니다.');
        }

        try {
            await this.pushTokenStore.unregister(command);
            this.logger.logSuccess('unregisterPushToken', '디바이스 푸시 토큰 해제 완료', {
                userId: command.userId,
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.logError('unregisterPushToken', '디바이스 푸시 토큰 해제 실패', error);
            throw new BadRequestException('디바이스 토큰 해제에 실패했습니다.');
        }
    }
}
