import { NotificationItemMapperService } from '../../../domain/services/notification-item-mapper.service';
import { NotificationType } from '../../../../../common/enum/user.enum';

describe('NotificationItemMapperService', () => {
    const service = new NotificationItemMapperService();

    it('알림 레코드를 item 결과로 매핑하고 _id를 문자열로 변환한다', () => {
        const record = {
            _id: { toString: () => 'object-id-1' },
            type: NotificationType.MATCHING,
            title: '제목',
            body: '내용',
            metadata: { key: 'value' },
            isRead: false,
            readAt: undefined,
            targetUrl: '/some-url',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
        };

        const result = service.toItem(record);

        expect(result.notificationId).toBe('object-id-1');
        expect(result.type).toBe(NotificationType.MATCHING);
        expect(result.metadata).toEqual({ key: 'value' });
    });

    it('metadata와 readAt이 없어도 매핑한다', () => {
        const record = {
            _id: { toString: () => 'id' },
            type: NotificationType.MATCHING,
            title: 't',
            body: 'b',
            isRead: true,
            createdAt: new Date(),
        };
        const result = service.toItem(record);
        expect(result.metadata).toBeUndefined();
        expect(result.readAt).toBeUndefined();
    });
});
