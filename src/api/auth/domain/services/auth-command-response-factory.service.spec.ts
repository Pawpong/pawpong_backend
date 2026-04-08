import { AuthCommandResponseFactoryService } from './auth-command-response-factory.service';

describe('AuthCommandResponseFactoryService', () => {
    const service = new AuthCommandResponseFactoryService();

    it('전화번호 인증코드 발송 응답을 만든다', () => {
        expect(service.createPhoneVerificationCodeSent()).toEqual({
            success: true,
            message: '인증번호가 발송되었습니다.',
        });
    });

    it('전화번호 인증 완료 응답을 만든다', () => {
        expect(service.createPhoneVerificationCompleted()).toEqual({
            success: true,
            message: '전화번호 인증이 완료되었습니다.',
        });
    });

    it('로그아웃 응답을 만든다', () => {
        expect(service.createLoggedOut('2026-04-08T00:00:00.000Z')).toEqual({
            success: true,
            loggedOutAt: '2026-04-08T00:00:00.000Z',
            message: '로그아웃되었습니다.',
        });
    });
});
