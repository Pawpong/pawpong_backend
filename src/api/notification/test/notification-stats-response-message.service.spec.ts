import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';
import { NotificationStatsResponseMessageService } from '../domain/services/notification-stats-response-message.service';

describe('알림 통계 응답 메시지 서비스', () => {
    const service = new NotificationStatsResponseMessageService();

    it('통계 조회 메시지 계약을 유지한다', () => {
        expect(service.notificationStatsRetrieved()).toBe(
            NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationStatsRetrieved,
        );
    });
});
