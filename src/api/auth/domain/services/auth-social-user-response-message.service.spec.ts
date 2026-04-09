import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { AuthSocialUserResponseMessageService } from './auth-social-user-response-message.service';

describe('소셜 유저 조회 응답 메시지 서비스', () => {
    const service = new AuthSocialUserResponseMessageService();

    it('소셜 유저 조회 메시지를 반환한다', () => {
        expect(service.getSocialUserCheckMessage(true)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserFound);
        expect(service.getSocialUserCheckMessage(false)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserNotFound);
    });
});
