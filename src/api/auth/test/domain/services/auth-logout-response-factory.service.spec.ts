import { AUTH_RESPONSE_MESSAGE_EXAMPLES, buildAuthLogoutResult } from '../../../constants/auth-response-messages';

describe('로그아웃 응답 상수', () => {
    it('로그아웃 응답을 만든다', () => {
        expect(buildAuthLogoutResult('2026-04-08T00:00:00.000Z')).toEqual({
            success: true,
            loggedOutAt: '2026-04-08T00:00:00.000Z',
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.logoutCompleted,
        });
    });
});
