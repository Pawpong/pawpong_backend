import { NotificationAdminStatsResultMapperService } from '../../../domain/services/notification-admin-stats-result-mapper.service';

describe('관리자 알림 통계 결과 매퍼', () => {
    const service = new NotificationAdminStatsResultMapperService();

    it('알림 통계를 그대로 응답으로 만든다', () => {
        expect(
            service.toResult({
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
