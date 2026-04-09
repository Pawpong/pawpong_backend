import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { AuthSessionResponseMessageService } from './auth-session-response-message.service';

describe('인증 세션 응답 메시지 서비스', () => {
    const service = new AuthSessionResponseMessageService();

    it('토큰 재발급 메시지를 반환한다', () => {
        expect(service.getTokenRefreshed()).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.tokenRefreshed);
    });
});
