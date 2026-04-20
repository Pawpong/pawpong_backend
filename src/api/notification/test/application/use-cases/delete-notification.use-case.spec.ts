import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { NotificationType } from '../../../../../common/enum/user.enum';
import { DeleteNotificationUseCase } from '../../../application/use-cases/delete-notification.use-case';
import { type NotificationInboxPort } from '../../../application/ports/notification-inbox.port';

describe('알림 삭제 유스케이스', () => {
    it('대상이 있으면 삭제를 완료한다', async () => {
        const useCase = new DeleteNotificationUseCase({
            findPagedByUser: jest.fn(),
            countUnreadByUser: jest.fn(),
            findByIdForUser: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
            deleteForUser: jest.fn().mockResolvedValue(1),
        });

        await expect(useCase.execute('user-1', 'notification-1')).resolves.toBeUndefined();
    });

    it('대상이 없으면 도메인 not found 예외를 던진다', async () => {
        const inboxPort: NotificationInboxPort = {
            findPagedByUser: jest.fn(),
            countUnreadByUser: jest.fn(),
            findByIdForUser: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
            deleteForUser: jest.fn().mockResolvedValue(0),
        };
        const useCase = new DeleteNotificationUseCase(inboxPort);

        await expect(useCase.execute('user-1', 'missing')).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
