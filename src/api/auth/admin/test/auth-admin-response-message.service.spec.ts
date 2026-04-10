import { AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/auth-admin-response-messages';

describe('관리자 인증 응답 메시지 상수', () => {
    it('관리자 인증 응답 메시지 계약을 유지한다', () => {
        expect(AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES.adminLoginCompleted).toBe('관리자 로그인이 완료되었습니다.');
        expect(AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES.adminTokenRefreshed).toBe('토큰이 갱신되었습니다.');
    });
});
