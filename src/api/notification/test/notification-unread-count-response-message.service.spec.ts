import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';

describe('알림 미확인 개수 응답 메시지 상수', () => {
    it('미확인 개수 조회 메시지 계약을 유지한다', () => {
        expect(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.unreadCountRetrieved).toBe('읽지 않은 알림 수가 조회되었습니다.');
    });
});
