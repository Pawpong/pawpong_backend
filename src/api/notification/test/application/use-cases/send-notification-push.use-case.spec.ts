import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { SendNotificationPushUseCase } from '../../../application/use-cases/send-notification-push.use-case';
import type {
    NotificationPushDeliveryResult,
    NotificationPushMessage,
    NotificationPushPort,
} from '../../../application/ports/notification-push.port';
import type { NotificationPushTokenStorePort } from '../../../application/ports/notification-push-token-store.port';

describe('푸시 알림 발송 유스케이스', () => {
    const logger = {
        logWarning: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    let pushPort: jest.Mocked<NotificationPushPort>;
    let tokenStore: jest.Mocked<NotificationPushTokenStorePort>;
    let useCase: SendNotificationPushUseCase;

    const message: NotificationPushMessage = {
        title: '새 알림',
        body: '확인해보세요',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        pushPort = {
            sendToTokens: jest.fn(),
        };
        tokenStore = {
            register: jest.fn().mockResolvedValue(undefined),
            unregister: jest.fn().mockResolvedValue(undefined),
            purgeInvalidTokens: jest.fn().mockResolvedValue(undefined),
            findTokensByUser: jest.fn(),
        };
        useCase = new SendNotificationPushUseCase(pushPort, tokenStore, logger);
    });

    it('등록된 토큰이 없으면 조기 반환하고 발송을 시도하지 않는다', async () => {
        tokenStore.findTokensByUser.mockResolvedValueOnce({
            userId: 'user-1',
            userRole: 'adopter',
            tokens: [],
        });

        await useCase.execute({ userId: 'user-1', userRole: 'adopter', message });

        expect(pushPort.sendToTokens).not.toHaveBeenCalled();
        expect(tokenStore.purgeInvalidTokens).not.toHaveBeenCalled();
    });

    it('FCM 무효 판정 토큰을 purgeInvalidTokens 로 정리한다', async () => {
        tokenStore.findTokensByUser.mockResolvedValueOnce({
            userId: 'user-1',
            userRole: 'adopter',
            tokens: ['valid-1', 'invalid-2', 'valid-3', 'invalid-4'],
        });
        const results: NotificationPushDeliveryResult[] = [
            { token: 'valid-1', success: true, invalidToken: false },
            { token: 'invalid-2', success: false, invalidToken: true, error: 'messaging/invalid-registration-token' },
            { token: 'valid-3', success: true, invalidToken: false },
            { token: 'invalid-4', success: false, invalidToken: true, error: 'messaging/registration-token-not-registered' },
        ];
        pushPort.sendToTokens.mockResolvedValueOnce(results);

        await useCase.execute({ userId: 'user-1', userRole: 'adopter', message });

        expect(tokenStore.purgeInvalidTokens).toHaveBeenCalledWith('user-1', 'adopter', ['invalid-2', 'invalid-4']);
    });

    it('모두 유효하면 purgeInvalidTokens 를 호출하지 않는다', async () => {
        tokenStore.findTokensByUser.mockResolvedValueOnce({
            userId: 'user-1',
            userRole: 'adopter',
            tokens: ['ok-1', 'ok-2'],
        });
        pushPort.sendToTokens.mockResolvedValueOnce([
            { token: 'ok-1', success: true, invalidToken: false },
            { token: 'ok-2', success: true, invalidToken: false },
        ]);

        await useCase.execute({ userId: 'user-1', userRole: 'adopter', message });

        expect(tokenStore.purgeInvalidTokens).not.toHaveBeenCalled();
    });

    it('예외 발생 시 fire-and-forget 으로 삼키고 호출 측에 전파하지 않는다', async () => {
        tokenStore.findTokensByUser.mockRejectedValueOnce(new Error('db-error'));

        await expect(useCase.execute({ userId: 'user-1', userRole: 'breeder', message })).resolves.toBeUndefined();
        expect(logger.logError).toHaveBeenCalled();
    });

    it('purge 로그에 raw 토큰 문자열이 포함되지 않는다', async () => {
        const sensitiveToken = 'fcm-secret-leak-candidate';
        tokenStore.findTokensByUser.mockResolvedValueOnce({
            userId: 'user-1',
            userRole: 'adopter',
            tokens: [sensitiveToken],
        });
        pushPort.sendToTokens.mockResolvedValueOnce([
            { token: sensitiveToken, success: false, invalidToken: true, error: 'messaging/invalid-argument' },
        ]);

        await useCase.execute({ userId: 'user-1', userRole: 'adopter', message });

        for (const call of (logger.logWarning as jest.Mock).mock.calls) {
            expect(JSON.stringify(call)).not.toContain(sensitiveToken);
        }
    });
});
