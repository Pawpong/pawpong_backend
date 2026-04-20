import { NotificationPageAssemblerService } from '../../../domain/services/notification-page-assembler.service';
import { NotificationItemMapperService } from '../../../domain/services/notification-item-mapper.service';
import { NotificationPaginationAssemblerService } from '../../../domain/services/notification-pagination-assembler.service';
import { NotificationType } from '../../../../../common/enum/user.enum';

describe('NotificationPageAssemblerService', () => {
    const service = new NotificationPageAssemblerService(
        new NotificationItemMapperService(),
        new NotificationPaginationAssemblerService(),
    );

    it('알림 배열을 매핑하여 페이지네이션 결과로 반환한다', () => {
        const result = service.build(
            [
                {
                    _id: { toString: () => 'id-1' },
                    type: NotificationType.MATCHING,
                    title: 't',
                    body: 'b',
                    isRead: false,
                    createdAt: new Date(),
                },
            ],
            1,
            10,
            1,
        );
        expect(result.items).toHaveLength(1);
        expect(result.items[0].notificationId).toBe('id-1');
        expect(result.pagination.totalItems).toBe(1);
    });
});
