import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { AuthLogoutResponseFactoryService } from './auth-logout-response-factory.service';

describe('로그아웃 응답 팩토리 서비스', () => {
    const service = new AuthLogoutResponseFactoryService();

    it('로그아웃 응답을 만든다', () => {
        expect(service.createLoggedOut('2026-04-08T00:00:00.000Z')).toEqual({
            success: true,
            loggedOutAt: '2026-04-08T00:00:00.000Z',
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.logoutCompleted,
        });
    });
});
