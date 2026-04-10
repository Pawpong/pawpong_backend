import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';
import { NotificationListResponseMessageService } from '../domain/services/notification-list-response-message.service';

describe('알림 목록 응답 메시지 서비스', () => {
    const service = new NotificationListResponseMessageService();

    it('알림 목록 조회 메시지 계약을 유지한다', () => {
        expect(service.notificationsListed()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed);
    });
});
