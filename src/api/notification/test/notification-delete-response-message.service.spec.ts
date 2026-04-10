import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';
import { NotificationDeleteResponseMessageService } from '../domain/services/notification-delete-response-message.service';

describe('알림 삭제 응답 메시지 서비스', () => {
    const service = new NotificationDeleteResponseMessageService();

    it('삭제 메시지 계약을 유지한다', () => {
        expect(service.notificationDeleted()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationDeleted);
    });
});
