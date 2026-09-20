import { BadRequestException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import { RegisterAnonymousDeviceUseCase } from '../../../application/use-cases/register-anonymous-device.use-case';
import type { NotificationDeviceRegistryPort } from '../../../application/ports/notification-device-registry.port';
import type { NotificationPushPort } from '../../../application/ports/notification-push.port';

describe('비로그인 기기 등록 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    let deviceRegistry: jest.Mocked<NotificationDeviceRegistryPort>;
    let pushPort: jest.Mocked<NotificationPushPort>;
    let useCase: RegisterAnonymousDeviceUseCase;

    const token = 'fcm-token-abcdefghijklmnop';

    beforeEach(() => {
        jest.clearAllMocks();
        deviceRegistry = {
            registerDevice: jest.fn().mockResolvedValue({ isNewDevice: false }),
            bindToUser: jest.fn().mockResolvedValue(undefined),
            unbind: jest.fn().mockResolvedValue(undefined),
            markWelcomeSent: jest.fn().mockResolvedValue(undefined),
            removeTokens: jest.fn().mockResolvedValue(undefined),
        };
        pushPort = {
            sendToTokens: jest.fn().mockResolvedValue([{ token, success: true, invalidToken: false }]),
        };
        useCase = new RegisterAnonymousDeviceUseCase(deviceRegistry, pushPort, logger);
    });

    it('로그인 정보 없이 기기를 등록한다', async () => {
        await useCase.execute({ token, platform: 'ios', appVersion: '1.0.0' });

        expect(deviceRegistry.registerDevice).toHaveBeenCalledWith({
            token,
            platform: 'ios',
            appVersion: '1.0.0',
        });
    });

    it('token 이 비어 있으면 BadRequestException 을 던진다', async () => {
        await expect(useCase.execute({ token: '' })).rejects.toBeInstanceOf(BadRequestException);
        expect(deviceRegistry.registerDevice).not.toHaveBeenCalled();
    });

    it('처음 등록된 기기에만 안내 푸시를 보내고 발송 완료를 기록한다', async () => {
        deviceRegistry.registerDevice.mockResolvedValueOnce({ isNewDevice: true });

        await useCase.execute({ token });

        expect(pushPort.sendToTokens).toHaveBeenCalledWith(
            [token],
            expect.objectContaining({ title: expect.any(String) }),
        );
        expect(deviceRegistry.markWelcomeSent).toHaveBeenCalledWith(token);
    });

    it('이미 등록된 기기에는 안내 푸시를 다시 보내지 않는다', async () => {
        await useCase.execute({ token });

        expect(pushPort.sendToTokens).not.toHaveBeenCalled();
        expect(deviceRegistry.markWelcomeSent).not.toHaveBeenCalled();
    });

    it('안내 푸시가 실패해도 기기 등록은 성공으로 둔다', async () => {
        deviceRegistry.registerDevice.mockResolvedValueOnce({ isNewDevice: true });
        pushPort.sendToTokens.mockRejectedValueOnce(new Error('fcm-down'));

        await expect(useCase.execute({ token })).resolves.toBeUndefined();
        expect(deviceRegistry.markWelcomeSent).not.toHaveBeenCalled();
    });

    it('FCM 이 무효 토큰으로 판정하면 기기를 제거한다', async () => {
        deviceRegistry.registerDevice.mockResolvedValueOnce({ isNewDevice: true });
        pushPort.sendToTokens.mockResolvedValueOnce([{ token, success: false, invalidToken: true }]);

        await useCase.execute({ token });

        expect(deviceRegistry.removeTokens).toHaveBeenCalledWith([token]);
        expect(deviceRegistry.markWelcomeSent).not.toHaveBeenCalled();
    });

    it('기기 등록 자체가 실패하면 BadRequestException 으로 감싼다', async () => {
        deviceRegistry.registerDevice.mockRejectedValueOnce(new Error('db-down'));

        await expect(useCase.execute({ token })).rejects.toBeInstanceOf(BadRequestException);
    });
});
