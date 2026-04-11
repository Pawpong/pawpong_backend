import { NotificationType } from '../../../../../common/enum/user.enum';
import { RecipientType } from '../../../../../common/enum/user.enum';
import { NotificationListPresentationService } from '../../../domain/services/notification-list-presentation.service';
import { NotificationPaginationAssemblerService } from '../../../domain/services/notification-pagination-assembler.service';
import { CreateNotificationFromBuilderUseCase } from '../../../application/use-cases/create-notification-from-builder.use-case';

describe('알림 from 빌더 생성 유스케이스', () => {
    const notificationCommandPort = {
        create: jest.fn(),
    };

    const useCase = new CreateNotificationFromBuilderUseCase(
        notificationCommandPort as any,
        new NotificationListPresentationService(new NotificationPaginationAssemblerService()),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('builder 데이터를 브리더 알림으로 저장하고 응답 객체로 반환한다', async () => {
        notificationCommandPort.create.mockResolvedValue({
            _id: { toString: () => 'notification-1' },
            type: NotificationType.NEW_REVIEW_REGISTERED,
            title: '새로운 후기',
            body: '후기가 등록되었습니다.',
            metadata: { breederId: 'breeder-1' },
            isRead: false,
            targetUrl: '/explore/breeder/breeder-1#reviews',
            createdAt: new Date('2026-04-06T08:00:00.000Z'),
        });

        const result = await useCase.execute({
            recipientId: 'breeder-1',
            recipientType: RecipientType.BREEDER,
            type: NotificationType.NEW_REVIEW_REGISTERED,
            title: '새로운 후기',
            content: '후기가 등록되었습니다.',
            metadata: { breederId: 'breeder-1' },
            targetUrl: '/explore/breeder/breeder-1#reviews',
        });

        expect(notificationCommandPort.create).toHaveBeenCalledWith({
            userId: 'breeder-1',
            userRole: 'breeder',
            type: NotificationType.NEW_REVIEW_REGISTERED,
            title: '새로운 후기',
            body: '후기가 등록되었습니다.',
            metadata: { breederId: 'breeder-1' },
            targetUrl: '/explore/breeder/breeder-1#reviews',
            isRead: false,
        });
        expect(result).toMatchObject({
            notificationId: 'notification-1',
            type: NotificationType.NEW_REVIEW_REGISTERED,
            title: '새로운 후기',
            body: '후기가 등록되었습니다.',
            isRead: false,
        });
    });
});
