import { NotificationPaginationAssemblerService } from '../domain/services/notification-pagination-assembler.service';
import { NotificationType } from '../../../schema/notification.schema';

describe('알림 페이지네이션 조립 서비스', () => {
    it('알림 목록 페이지네이션 응답 계약을 유지한다', () => {
        const service = new NotificationPaginationAssemblerService();

        expect(
            service.build(
                [
                    {
                        notificationId: 'notification-1',
                        type: NotificationType.CONSULT_COMPLETED,
                        title: '상담 완료',
                        body: '상담이 완료되었습니다.',
                        metadata: undefined,
                        isRead: false,
                        readAt: undefined,
                        targetUrl: '/applications/app-1',
                        createdAt: new Date('2026-04-09T00:00:00.000Z'),
                    },
                ],
                1,
                20,
                1,
            ),
        ).toMatchObject({
            items: [
                {
                    notificationId: 'notification-1',
                    type: NotificationType.CONSULT_COMPLETED,
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
