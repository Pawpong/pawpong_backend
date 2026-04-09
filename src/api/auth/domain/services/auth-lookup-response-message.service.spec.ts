import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { AuthLookupResponseMessageService } from './auth-lookup-response-message.service';

describe('인증 조회 응답 메시지 서비스', () => {
    const service = new AuthLookupResponseMessageService();

    it('중복 체크 메시지를 상황별로 반환한다', () => {
        expect(service.getDuplicateCheckMessage('email', false)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.emailAvailable);
        expect(service.getDuplicateCheckMessage('email', true)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.emailDuplicated);
        expect(service.getDuplicateCheckMessage('nickname', false)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameAvailable,
        );
        expect(service.getDuplicateCheckMessage('nickname', true)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameDuplicated,
        );
        expect(service.getDuplicateCheckMessage('breederName', false)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameAvailable,
        );
        expect(service.getDuplicateCheckMessage('breederName', true)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameDuplicated,
        );
    });

    it('소셜 유저 조회와 배너 조회 메시지를 반환한다', () => {
        expect(service.getSocialUserCheckMessage(true)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserFound);
        expect(service.getSocialUserCheckMessage(false)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserNotFound);
        expect(service.getBannerListed('login')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.loginBannersListed);
        expect(service.getBannerListed('signup')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.registerBannersListed);
    });
});
