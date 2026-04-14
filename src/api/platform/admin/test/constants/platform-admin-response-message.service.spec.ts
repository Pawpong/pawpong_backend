import { PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/platform-admin-response-messages';

describe('플랫폼 관리자 응답 메시지 상수', () => {
    it('통계 응답 메시지 계약을 유지한다', () => {
        expect(PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES.platformStatsRetrieved).toBe('시스템 통계가 조회되었습니다.');
        expect(PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES.platformMvpStatsRetrieved).toBe('MVP 통계가 조회되었습니다.');
    });
});
