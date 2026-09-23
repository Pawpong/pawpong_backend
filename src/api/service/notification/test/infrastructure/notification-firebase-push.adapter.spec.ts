import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { NotificationFirebasePushAdapter } from '../../infrastructure/notification-firebase-push.adapter';

/** 실제 SDK 호출 경계에서 RN이 받는 payload와 무효 토큰 판정을 확인한다. */
describe('Firebase push payload', () => {
    const logger = { logWarning: jest.fn(), logError: jest.fn() } as unknown as CustomLoggerService;

    it('notification + data.targetUrl과 올바른 APNs alert 헤더를 전달한다', async () => {
        const sendEachForMulticast = jest.fn().mockResolvedValue({ responses: [{ success: true }] });
        const adapter = new NotificationFirebasePushAdapter(new ConfigService({ NODE_ENV: 'production' }), logger);
        (adapter as any).messaging = { sendEachForMulticast };
        await adapter.sendToTokens(['owned-fixture'], {
            title: '제목',
            body: '본문',
            targetUrl: 'https://pawpong.kr/l/mobile-share',
        });
        expect(sendEachForMulticast).toHaveBeenCalledWith(
            expect.objectContaining({
                tokens: ['owned-fixture'],
                notification: { title: '제목', body: '본문' },
                data: { targetUrl: 'https://pawpong.kr/l/mobile-share' },
                apns: {
                    headers: { 'apns-push-type': 'alert', 'apns-priority': '10' },
                    payload: { aps: { sound: 'default' } },
                },
            }),
        );
    });

    it('페이로드 오류는 유효한 기기 토큰 삭제 근거가 되지 않는다', async () => {
        const adapter = new NotificationFirebasePushAdapter(new ConfigService(), logger);
        (adapter as any).messaging = {
            sendEachForMulticast: jest.fn().mockResolvedValue({
                responses: [
                    { success: false, error: { code: 'messaging/invalid-argument' } },
                    { success: false, error: { code: 'messaging/registration-token-not-registered' } },
                ],
            }),
        };
        const results = await adapter.sendToTokens(['owned-valid', 'owned-expired'], { title: '제목', body: '본문' });
        expect(results.map((result) => result.invalidToken)).toEqual([false, true]);
    });

    it('자격증명이 없으면 발송 성공으로 표시하지 않는다', async () => {
        const adapter = new NotificationFirebasePushAdapter(new ConfigService(), logger);
        const [result] = await adapter.sendToTokens(['owned-fixture'], { title: '제목', body: '본문' });
        expect(result).toMatchObject({ success: false, invalidToken: false, error: 'fcm-not-initialized' });
    });
});
