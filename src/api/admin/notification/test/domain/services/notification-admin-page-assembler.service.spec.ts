import { NotificationType } from '../../../../../../common/enum/user.enum';
import { NotificationAdminItemMapperService } from '../../../domain/services/notification-admin-item-mapper.service';
import { NotificationAdminPageAssemblerService } from '../../../domain/services/notification-admin-page-assembler.service';
import { NotificationAdminPaginationAssemblerService } from '../../../domain/services/notification-admin-pagination-assembler.service';

describe('관리자 알림 페이지 조립 서비스', () => {
    const service = new NotificationAdminPageAssemblerService(
        new NotificationAdminItemMapperService(),
        new NotificationAdminPaginationAssemblerService(),
    );

    it('알림 목록을 페이지 응답으로 조립한다', () => {
        expect(
            service.build(
                {
                    items: [
                        {
                            notificationId: 'noti-1',
                            userId: 'user-1',
                            userRole: 'adopter',
                            type: NotificationType.NEW_CONSULT_REQUEST,
                            title: '새 상담',
                            body: '상담이 도착했습니다.',
                            metadata: { applicationId: 'application-1' },
                            isRead: false,
                            readAt: undefined,
                            targetUrl: '/notifications/1',
                            createdAt: new Date('2026-04-09T00:00:00.000Z'),
                            updatedAt: new Date('2026-04-09T00:00:00.000Z'),
                        },
                    ],
                    totalItems: 1,
                },
                1,
                20,
            ),
        ).toMatchObject({
            items: [
                {
                    notificationId: 'noti-1',
                    userId: 'user-1',
                    type: NotificationType.NEW_CONSULT_REQUEST,
                    title: '새 상담',
                },
            ],
            pagination: {
                currentPage: 1,
                pageSize: 20,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
            },
        });
    });
});
