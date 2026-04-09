import { NotificationAdminStatsPresentationService } from '../domain/services/notification-admin-stats-presentation.service';

describe('관리자 알림 통계 응답 서비스', () => {
    const service = new NotificationAdminStatsPresentationService();

    it('알림 통계를 그대로 응답으로 만든다', () => {
        expect(
            service.toStats({
                totalNotifications: 10,
                unreadNotifications: 3,
                notificationsByType: {
                    NEW_CONSULT_REQUEST: 4,
                },
                notificationsByRole: {
                    adopter: 6,
                    breeder: 4,
                },
            }),
        ).toEqual({
            totalNotifications: 10,
            unreadNotifications: 3,
            notificationsByType: {
                NEW_CONSULT_REQUEST: 4,
            },
            notificationsByRole: {
                adopter: 6,
                breeder: 4,
            },
        });
    });
});
