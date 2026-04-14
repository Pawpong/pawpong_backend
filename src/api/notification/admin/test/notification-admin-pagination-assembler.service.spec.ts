import { NotificationType } from '../../../../common/enum/user.enum';
import { NotificationAdminPaginationAssemblerService } from '../domain/services/notification-admin-pagination-assembler.service';

describe('관리자 알림 페이지네이션 조립 서비스', () => {
    it('관리자 알림 목록 페이지네이션 응답 계약을 유지한다', () => {
        const service = new NotificationAdminPaginationAssemblerService();

        expect(
            service.build(
                [
                    {
                        notificationId: 'noti-1',
                        userId: 'user-1',
                        userRole: 'adopter',
                        type: NotificationType.NEW_CONSULT_REQUEST,
                        title: '새 상담',
                        body: '상담이 도착했습니다.',
                        metadata: undefined,
                        isRead: false,
                        readAt: undefined,
                        targetUrl: undefined,
                        createdAt: new Date('2026-04-06T00:00:00.000Z'),
                        updatedAt: new Date('2026-04-06T00:00:00.000Z'),
                    },
                ],
                1,
                20,
                1,
            ),
        ).toMatchObject({
            items: [
                {
                    notificationId: 'noti-1',
                    type: NotificationType.NEW_CONSULT_REQUEST,
                },
            ],
            pagination: {
                currentPage: 1,
                pageSize: 20,
                totalItems: 1,
                totalPages: 1,
            },
        });
    });
});
