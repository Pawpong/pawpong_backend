import { NotificationAdminItemMapperService } from '../../../domain/services/notification-admin-item-mapper.service';
import { NotificationType } from '../../../../../../common/enum/user.enum';

describe('NotificationAdminItemMapperService', () => {
    const service = new NotificationAdminItemMapperService();

    it('레코드를 item 결과로 1:1 매핑한다', () => {
        const record = {
            notificationId: 'n-1',
            userId: 'user-1',
            userRole: 'adopter' as const,
            type: NotificationType.MATCHING,
            title: '제목',
            body: '내용',
            metadata: { key: 'value' },
            isRead: false,
            readAt: undefined,
            targetUrl: undefined,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        };

        expect(service.toItem(record)).toEqual(record);
    });
});
