import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';

describe('인증 가입 응답 메시지 상수', () => {
    it('역할별 회원가입 메시지를 반환한다', () => {
        expect(AUTH_RESPONSE_MESSAGE_EXAMPLES.adopterSignupCompleted).toBe('입양자 회원가입이 완료되었습니다.');
        expect(AUTH_RESPONSE_MESSAGE_EXAMPLES.breederSignupCompleted).toBe('브리더 회원가입이 완료되었습니다.');
    });

    it('소셜 회원가입 완료 메시지를 반환한다', () => {
        expect(AUTH_RESPONSE_MESSAGE_EXAMPLES.socialRegistrationCompleted).toBe('소셜 회원가입이 완료되었습니다.');
    });
});
