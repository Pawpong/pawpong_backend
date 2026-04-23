import { BadRequestException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { RegisterPushDeviceTokenUseCase } from '../../../application/use-cases/register-push-device-token.use-case';
import type {
    NotificationPushTokenStorePort,
    RegisterPushDeviceTokenCommand,
} from '../../../application/ports/notification-push-token-store.port';

describe('디바이스 푸시 토큰 등록 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    let pushTokenStore: jest.Mocked<NotificationPushTokenStorePort>;
    let useCase: RegisterPushDeviceTokenUseCase;

    const baseCommand: RegisterPushDeviceTokenCommand = {
        userId: 'user-1',
        userRole: 'adopter',
        token: 'fcm-token-abcdefghijklmnop',
        platform: 'ios',
        appVersion: '1.0.0',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        pushTokenStore = {
            register: jest.fn().mockResolvedValue(undefined),
            unregister: jest.fn().mockResolvedValue(undefined),
            purgeInvalidTokens: jest.fn().mockResolvedValue(undefined),
            findTokensByUser: jest.fn().mockResolvedValue({ userId: 'user-1', userRole: 'adopter', tokens: [] }),
        };
        useCase = new RegisterPushDeviceTokenUseCase(pushTokenStore, logger);
    });

    it('포트 register 를 커맨드 그대로 호출한다', async () => {
        await useCase.execute(baseCommand);

        expect(pushTokenStore.register).toHaveBeenCalledWith(baseCommand);
    });

    it('userId 가 비어 있으면 BadRequestException 을 던진다', async () => {
        await expect(useCase.execute({ ...baseCommand, userId: '' })).rejects.toBeInstanceOf(BadRequestException);
        expect(pushTokenStore.register).not.toHaveBeenCalled();
    });

    it('token 이 비어 있으면 BadRequestException 을 던진다', async () => {
        await expect(useCase.execute({ ...baseCommand, token: '' })).rejects.toBeInstanceOf(BadRequestException);
        expect(pushTokenStore.register).not.toHaveBeenCalled();
    });

    it('포트가 실패하면 BadRequestException 으로 감싼다', async () => {
        pushTokenStore.register.mockRejectedValueOnce(new Error('db-down'));

        await expect(useCase.execute(baseCommand)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('성공 로그에 raw 토큰 문자열을 포함하지 않는다', async () => {
        await useCase.execute(baseCommand);

        const allLogCalls = [
            ...(logger.logStart as jest.Mock).mock.calls,
            ...(logger.logSuccess as jest.Mock).mock.calls,
        ];
        for (const call of allLogCalls) {
            const payload = JSON.stringify(call);
            expect(payload).not.toContain(baseCommand.token);
        }
    });
});
