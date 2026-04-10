import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';
import { NotificationUnreadCountResponseMessageService } from '../domain/services/notification-unread-count-response-message.service';

describe('알림 미확인 개수 응답 메시지 서비스', () => {
    const service = new NotificationUnreadCountResponseMessageService();

    it('미확인 개수 조회 메시지 계약을 유지한다', () => {
        expect(service.unreadCountRetrieved()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.unreadCountRetrieved);
    });
});
