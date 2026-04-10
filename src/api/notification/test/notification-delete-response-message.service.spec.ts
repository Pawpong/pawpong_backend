import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';

describe('알림 삭제 응답 메시지 상수', () => {
    it('삭제 메시지 계약을 유지한다', () => {
        expect(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationDeleted).toBe('알림이 삭제되었습니다.');
    });
});
