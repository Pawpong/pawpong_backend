import { AuthCommandResponseFactoryService } from './auth-command-response-factory.service';
import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from './auth-response-message.service';

describe('인증 명령 응답 팩토리 서비스', () => {
    const service = new AuthCommandResponseFactoryService();

    it('전화번호 인증코드 발송 응답을 만든다', () => {
        expect(service.createPhoneVerificationCodeSent()).toEqual({
            success: true,
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCodeSent,
        });
    });

    it('전화번호 인증 완료 응답을 만든다', () => {
        expect(service.createPhoneVerificationCompleted()).toEqual({
            success: true,
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCompleted,
        });
    });

    it('로그아웃 응답을 만든다', () => {
        expect(service.createLoggedOut('2026-04-08T00:00:00.000Z')).toEqual({
            success: true,
            loggedOutAt: '2026-04-08T00:00:00.000Z',
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.logoutCompleted,
        });
    });
});
