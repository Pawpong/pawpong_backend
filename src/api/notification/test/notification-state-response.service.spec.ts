import { NotificationStateResponseService } from '../domain/services/notification-state-response.service';

describe('알림 상태 응답 서비스', () => {
    it('읽지 않은 알림 수 응답 계약을 유지한다', () => {
        const service = new NotificationStateResponseService();

        expect(service.toUnreadCount(3)).toEqual({ unreadCount: 3 });
    });
});
