import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { AuthPhoneVerificationResponseFactoryService } from './auth-phone-verification-response-factory.service';

describe('전화번호 인증 응답 팩토리 서비스', () => {
    const service = new AuthPhoneVerificationResponseFactoryService();

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
});
