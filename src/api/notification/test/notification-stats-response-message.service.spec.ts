import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';

describe('알림 통계 응답 메시지 상수', () => {
    it('통계 조회 메시지 계약을 유지한다', () => {
        expect(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationStatsRetrieved).toBe('알림 통계가 조회되었습니다.');
    });
});
