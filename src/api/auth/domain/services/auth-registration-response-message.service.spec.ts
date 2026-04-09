import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { AuthRegistrationResponseMessageService } from './auth-registration-response-message.service';

describe('인증 가입 응답 메시지 서비스', () => {
    const service = new AuthRegistrationResponseMessageService();

    it('역할별 회원가입 메시지를 반환한다', () => {
        expect(service.getSignupCompleted('adopter')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.adopterSignupCompleted);
        expect(service.getSignupCompleted('breeder')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.breederSignupCompleted);
    });

    it('소셜 회원가입 완료 메시지를 반환한다', () => {
        expect(service.getSocialRegistrationCompleted()).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.socialRegistrationCompleted,
        );
    });
});
