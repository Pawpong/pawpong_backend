import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { NotificationType } from '../../../../../common/enum/user.enum';
import { MarkNotificationReadUseCase } from '../../../application/use-cases/mark-notification-read.use-case';
import { type NotificationInboxPort } from '../../../application/ports/notification-inbox.port';
import { NotificationStateResultMapperService } from '../../../domain/services/notification-state-result-mapper.service';

describe('알림 읽음 처리 유스케이스', () => {
    it('대상이 있으면 읽음 결과를 반환한다', async () => {
        const useCase = new MarkNotificationReadUseCase(
            {
                findPagedByUser: jest.fn(),
                countUnreadByUser: jest.fn(),
                findByIdForUser: jest.fn(),
                markAsRead: jest.fn().mockResolvedValue({
                    _id: { toString: () => 'notification-1' },
                    type: NotificationType.CONSULT_COMPLETED,
                    title: '상담 완료',
                    body: '후기를 남겨주세요.',
                    isRead: true,
                    readAt: new Date('2026-04-15T00:00:00.000Z'),
                    createdAt: new Date('2026-04-15T00:00:00.000Z'),
                }),
                markAllAsRead: jest.fn(),
                deleteForUser: jest.fn(),
            },
            new NotificationStateResultMapperService(),
        );

        await expect(useCase.execute('user-1', 'notification-1')).resolves.toMatchObject({
            notificationId: 'notification-1',
            isRead: true,
        });
    });

    it('대상이 없으면 도메인 not found 예외를 던진다', async () => {
        const inboxPort: NotificationInboxPort = {
            findPagedByUser: jest.fn(),
            countUnreadByUser: jest.fn(),
            findByIdForUser: jest.fn(),
            markAsRead: jest.fn().mockResolvedValue(null),
            markAllAsRead: jest.fn(),
            deleteForUser: jest.fn(),
        };
        const useCase = new MarkNotificationReadUseCase(
            inboxPort,
            new NotificationStateResultMapperService(),
        );

        await expect(useCase.execute('user-1', 'missing')).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
