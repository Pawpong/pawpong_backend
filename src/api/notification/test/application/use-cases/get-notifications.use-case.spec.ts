import { GetNotificationsUseCase } from '../../../application/use-cases/get-notifications.use-case';
import { NotificationPageAssemblerService } from '../../../domain/services/notification-page-assembler.service';
import { NotificationPaginationAssemblerService } from '../../../domain/services/notification-pagination-assembler.service';
import { NotificationItemMapperService } from '../../../domain/services/notification-item-mapper.service';
import { NotificationType } from '../../../../../common/enum/user.enum';
import { NotificationInboxRecord } from '../../../application/ports/notification-inbox.port';

function makeRecord(overrides: Partial<NotificationInboxRecord> = {}): NotificationInboxRecord {
    return {
        _id: { toString: () => 'noti-1' } as any,
        type: NotificationType.CONSULT_COMPLETED,
        title: '알림 제목',
        body: '알림 내용',
        isRead: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

describe('알림 목록 조회 유스케이스', () => {
    const notificationInboxPort = {
        findPagedByUser: jest.fn(),
        countUnreadByUser: jest.fn(),
        findByIdForUser: jest.fn(),
        markAsRead: jest.fn(),
        markAllAsRead: jest.fn(),
        deleteForUser: jest.fn(),
    };

    const pageAssembler = new NotificationPageAssemblerService(
        new NotificationItemMapperService(),
        new NotificationPaginationAssemblerService(),
    );

    const useCase = new GetNotificationsUseCase(notificationInboxPort as any, pageAssembler);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('알림 목록 페이지를 반환한다', async () => {
        notificationInboxPort.findPagedByUser.mockResolvedValue({
            items: [makeRecord()],
            totalItems: 1,
        });

        const result = await useCase.execute('user-1', {});

        expect(result.items).toHaveLength(1);
        expect(result.items[0].notificationId).toBe('noti-1');
    });

    it('알림이 없으면 빈 목록을 반환한다', async () => {
        notificationInboxPort.findPagedByUser.mockResolvedValue({ items: [], totalItems: 0 });

        const result = await useCase.execute('user-1', {});

        expect(result.items).toEqual([]);
        expect(result.pagination.totalItems).toBe(0);
    });

    it('isRead 필터를 포트에 전달한다', async () => {
        notificationInboxPort.findPagedByUser.mockResolvedValue({ items: [], totalItems: 0 });

        await useCase.execute('user-1', { isRead: false });

        expect(notificationInboxPort.findPagedByUser).toHaveBeenCalledWith(
            'user-1',
            expect.objectContaining({ isRead: false }),
        );
    });

    it('기본 페이지는 1, 기본 limit은 20이다', async () => {
        notificationInboxPort.findPagedByUser.mockResolvedValue({ items: [], totalItems: 0 });

        await useCase.execute('user-1', {});

        expect(notificationInboxPort.findPagedByUser).toHaveBeenCalledWith(
            'user-1',
            expect.objectContaining({ page: 1, limit: 20 }),
        );
    });
});
