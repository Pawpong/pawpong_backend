import { AuthAdminResponseMessageService } from '../domain/services/auth-admin-response-message.service';
import { AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/auth-admin-response-messages';

describe('관리자 인증 응답 메시지 서비스', () => {
    const service = new AuthAdminResponseMessageService();

    it('관리자 인증 응답 메시지 계약을 유지한다', () => {
        expect(service.adminLoginCompleted()).toBe(AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES.adminLoginCompleted);
        expect(service.adminTokenRefreshed()).toBe(AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES.adminTokenRefreshed);
    });
});
