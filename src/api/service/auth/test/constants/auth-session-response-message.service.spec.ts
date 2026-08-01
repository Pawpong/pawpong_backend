import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';

describe('인증 세션 응답 메시지 상수', () => {
    it('토큰 재발급 메시지를 반환한다', () => {
        expect(AUTH_RESPONSE_MESSAGE_EXAMPLES.tokenRefreshed).toBe('토큰이 재발급되었습니다.');
    });
});
