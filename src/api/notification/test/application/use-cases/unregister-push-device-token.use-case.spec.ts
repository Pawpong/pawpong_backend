import { BadRequestException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { UnregisterPushDeviceTokenUseCase } from '../../../application/use-cases/unregister-push-device-token.use-case';
import type {
    NotificationPushTokenStorePort,
    UnregisterPushDeviceTokenCommand,
} from '../../../application/ports/notification-push-token-store.port';

describe('디바이스 푸시 토큰 해제 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    let pushTokenStore: jest.Mocked<NotificationPushTokenStorePort>;
    let useCase: UnregisterPushDeviceTokenUseCase;

    const baseCommand: UnregisterPushDeviceTokenCommand = {
        userId: 'breeder-1',
        userRole: 'breeder',
        token: 'fcm-token-zyxwvutsrqponm',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        pushTokenStore = {
            register: jest.fn().mockResolvedValue(undefined),
            unregister: jest.fn().mockResolvedValue(undefined),
            purgeInvalidTokens: jest.fn().mockResolvedValue(undefined),
            findTokensByUser: jest.fn().mockResolvedValue({ userId: 'breeder-1', userRole: 'breeder', tokens: [] }),
        };
        useCase = new UnregisterPushDeviceTokenUseCase(pushTokenStore, logger);
    });

    it('포트 unregister 를 커맨드 그대로 호출한다 (body 기반 계약)', async () => {
        await useCase.execute(baseCommand);

        expect(pushTokenStore.unregister).toHaveBeenCalledWith(baseCommand);
    });

    it('등록되지 않은 토큰도 멱등하게 성공 처리한다', async () => {
        pushTokenStore.unregister.mockResolvedValueOnce(undefined);

        await expect(useCase.execute(baseCommand)).resolves.toBeUndefined();
        expect(pushTokenStore.unregister).toHaveBeenCalledTimes(1);
    });

    it('userId 가 비어 있으면 BadRequestException 을 던진다', async () => {
        await expect(useCase.execute({ ...baseCommand, userId: '' })).rejects.toBeInstanceOf(BadRequestException);
        expect(pushTokenStore.unregister).not.toHaveBeenCalled();
    });

    it('token 이 비어 있으면 BadRequestException 을 던진다', async () => {
        await expect(useCase.execute({ ...baseCommand, token: '' })).rejects.toBeInstanceOf(BadRequestException);
        expect(pushTokenStore.unregister).not.toHaveBeenCalled();
    });

    it('포트가 실패하면 BadRequestException 으로 감싼다', async () => {
        pushTokenStore.unregister.mockRejectedValueOnce(new Error('db-down'));

        await expect(useCase.execute(baseCommand)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('모든 로그에 raw 토큰 문자열을 포함하지 않는다', async () => {
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
