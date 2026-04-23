import { MarkAllNotificationsReadUseCase } from '../../../application/use-cases/mark-all-notifications-read.use-case';

describe('전체 알림 읽음 처리 유스케이스', () => {
    const notificationInboxPort = {
        findPagedByUser: jest.fn(),
        countUnreadByUser: jest.fn(),
        findByIdForUser: jest.fn(),
        markAsRead: jest.fn(),
        markAllAsRead: jest.fn(),
        deleteForUser: jest.fn(),
    };

    const useCase = new MarkAllNotificationsReadUseCase(notificationInboxPort as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('업데이트된 알림 수를 반환한다', async () => {
        notificationInboxPort.markAllAsRead.mockResolvedValue(7);

        const result = await useCase.execute('user-1');

        expect(result.updatedCount).toBe(7);
    });

    it('읽음 처리할 알림이 없으면 0을 반환한다', async () => {
        notificationInboxPort.markAllAsRead.mockResolvedValue(0);

        const result = await useCase.execute('user-1');

        expect(result.updatedCount).toBe(0);
    });

    it('사용자 ID와 현재 시각을 포트에 전달한다', async () => {
        notificationInboxPort.markAllAsRead.mockResolvedValue(0);
        const before = new Date();

        await useCase.execute('user-abc');

        const after = new Date();
        expect(notificationInboxPort.markAllAsRead).toHaveBeenCalledWith('user-abc', expect.any(Date));
        const calledDate: Date = notificationInboxPort.markAllAsRead.mock.calls[0][1];
        expect(calledDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(calledDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });
});
