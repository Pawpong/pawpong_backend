import { GetUnreadNotificationCountUseCase } from '../../../application/use-cases/get-unread-notification-count.use-case';
import { NotificationStateResultMapperService } from '../../../domain/services/notification-state-result-mapper.service';

describe('읽지 않은 알림 수 조회 유스케이스', () => {
    const notificationInboxPort = {
        findPagedByUser: jest.fn(),
        countUnreadByUser: jest.fn(),
        findByIdForUser: jest.fn(),
        markAsRead: jest.fn(),
        markAllAsRead: jest.fn(),
        deleteForUser: jest.fn(),
    };

    const useCase = new GetUnreadNotificationCountUseCase(
        notificationInboxPort as any,
        new NotificationStateResultMapperService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('읽지 않은 알림 수를 반환한다', async () => {
        notificationInboxPort.countUnreadByUser.mockResolvedValue(5);

        const result = await useCase.execute('user-1');

        expect(result.unreadCount).toBe(5);
    });

    it('읽지 않은 알림이 없으면 0을 반환한다', async () => {
        notificationInboxPort.countUnreadByUser.mockResolvedValue(0);

        const result = await useCase.execute('user-1');

        expect(result.unreadCount).toBe(0);
    });

    it('사용자 ID를 포트에 전달한다', async () => {
        notificationInboxPort.countUnreadByUser.mockResolvedValue(0);

        await useCase.execute('user-xyz');

        expect(notificationInboxPort.countUnreadByUser).toHaveBeenCalledWith('user-xyz');
    });
});
