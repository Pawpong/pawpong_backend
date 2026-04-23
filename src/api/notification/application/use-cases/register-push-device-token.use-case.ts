import { BadRequestException, HttpException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import {
    NOTIFICATION_PUSH_TOKEN_STORE_PORT,
    type NotificationPushTokenStorePort,
    type RegisterPushDeviceTokenCommand,
} from '../ports/notification-push-token-store.port';

/**
 * 디바이스 푸시 토큰을 사용자 계정에 등록합니다.
 * 같은 토큰이 이미 있으면 registeredAt만 갱신합니다.
 */
@Injectable()
export class RegisterPushDeviceTokenUseCase {
    constructor(
        @Inject(NOTIFICATION_PUSH_TOKEN_STORE_PORT)
        private readonly pushTokenStore: NotificationPushTokenStorePort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(command: RegisterPushDeviceTokenCommand): Promise<void> {
        this.logger.logStart('registerPushToken', '디바이스 푸시 토큰 등록 시작', {
            userId: command.userId,
            userRole: command.userRole,
            platform: command.platform,
        });

        if (!command.userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }
        if (!command.token) {
            throw new BadRequestException('푸시 토큰이 필요합니다.');
        }

        try {
            await this.pushTokenStore.register(command);
            this.logger.logSuccess('registerPushToken', '디바이스 푸시 토큰 등록 완료', {
                userId: command.userId,
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.logError('registerPushToken', '디바이스 푸시 토큰 등록 실패', error);
            throw new BadRequestException('디바이스 토큰 등록에 실패했습니다.');
        }
    }
}
