import { BadRequestException, HttpException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import {
    NOTIFICATION_DEVICE_REGISTRY_PORT,
    type NotificationDeviceRegistryPort,
    type RegisterAnonymousDeviceCommand,
} from '../ports/notification-device-registry.port';
import { NOTIFICATION_PUSH_PORT, type NotificationPushPort } from '../ports/notification-push.port';

/** 설치 직후 한 번만 보내는 안내 푸시 */
const WELCOME_PUSH = {
    title: '포퐁에 오신 걸 환영해요',
    body: '관심 있는 분양글을 저장해두면 새 소식이 올라올 때 알려드릴게요.',
    targetUrl: '/',
} as const;

/**
 * 로그인하지 않은 기기의 푸시 토큰을 등록합니다.
 *
 * 로그인해야만 토큰을 등록할 수 있으면 계정이 없는 사용자(앱 심사자 포함)는
 * 푸시를 한 번도 받지 못한다. 기기를 먼저 등록해두고, 나중에 로그인할 때
 * RegisterPushDeviceTokenUseCase가 같은 토큰을 계정에 바인딩한다.
 */
@Injectable()
export class RegisterAnonymousDeviceUseCase {
    constructor(
        @Inject(NOTIFICATION_DEVICE_REGISTRY_PORT)
        private readonly deviceRegistry: NotificationDeviceRegistryPort,
        @Inject(NOTIFICATION_PUSH_PORT)
        private readonly pushPort: NotificationPushPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(command: RegisterAnonymousDeviceCommand): Promise<void> {
        if (!command.token) {
            throw new BadRequestException('푸시 토큰이 필요합니다.');
        }

        this.logger.logStart('registerAnonymousDevice', '기기 푸시 토큰 등록 시작', {
            platform: command.platform,
            appVersion: command.appVersion,
        });

        try {
            const { isNewDevice } = await this.deviceRegistry.registerDevice(command);
            this.logger.logSuccess('registerAnonymousDevice', '기기 푸시 토큰 등록 완료', { isNewDevice });

            if (isNewDevice) {
                await this.sendWelcomePush(command.token);
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.logError('registerAnonymousDevice', '기기 푸시 토큰 등록 실패', error);
            throw new BadRequestException('기기 등록에 실패했습니다.');
        }
    }

    /**
     * 안내 푸시는 부가 기능이다. 실패해도 기기 등록 자체는 성공으로 둔다.
     */
    private async sendWelcomePush(token: string): Promise<void> {
        try {
            const [result] = await this.pushPort.sendToTokens([token], WELCOME_PUSH);
            if (result?.success) {
                await this.deviceRegistry.markWelcomeSent(token);
                return;
            }
            if (result?.invalidToken) {
                await this.deviceRegistry.removeTokens([token]);
            }
        } catch (error) {
            this.logger.logError('registerAnonymousDevice', '설치 안내 푸시 발송 실패', error);
        }
    }
}
