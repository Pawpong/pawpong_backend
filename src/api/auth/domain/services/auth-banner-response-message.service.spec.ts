import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { AuthBannerResponseMessageService } from './auth-banner-response-message.service';

describe('인증 배너 응답 메시지 서비스', () => {
    const service = new AuthBannerResponseMessageService();

    it('로그인과 회원가입 배너 조회 메시지를 반환한다', () => {
        expect(service.getBannerListed('login')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.loginBannersListed);
        expect(service.getBannerListed('signup')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.registerBannersListed);
    });
});
