import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';
import { NotificationQueryResponseMessageService } from '../domain/services/notification-query-response-message.service';

describe('알림 조회 응답 메시지 서비스', () => {
    const service = new NotificationQueryResponseMessageService();

    it('공개 경로와 관리자 조회 경로가 공유하는 메시지 계약을 유지한다', () => {
        expect(service.notificationsListed()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed);
        expect(service.unreadCountRetrieved()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.unreadCountRetrieved);
        expect(service.notificationStatsRetrieved()).toBe(
            NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationStatsRetrieved,
        );
    });
});
