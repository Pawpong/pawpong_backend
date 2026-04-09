import { USER_ADMIN_RESPONSE_MESSAGES } from '../domain/services/user-admin-response-message.service';

describe('USER_ADMIN_RESPONSE_MESSAGES', () => {
    it('관리자 응답 메시지 계약을 유지한다', () => {
        expect(USER_ADMIN_RESPONSE_MESSAGES.profileRetrieved).toBe('관리자 프로필이 조회되었습니다.');
        expect(USER_ADMIN_RESPONSE_MESSAGES.usersRetrieved).toBe('사용자 목록이 조회되었습니다.');
        expect(USER_ADMIN_RESPONSE_MESSAGES.deletedUserStatsRetrieved).toBe('탈퇴 사용자 통계가 조회되었습니다.');
        expect(USER_ADMIN_RESPONSE_MESSAGES.phoneWhitelistCreated).toBe('화이트리스트에 추가되었습니다.');
        expect(USER_ADMIN_RESPONSE_MESSAGES.phoneWhitelistDeleted).toBe('화이트리스트가 삭제되었습니다.');
    });
});
