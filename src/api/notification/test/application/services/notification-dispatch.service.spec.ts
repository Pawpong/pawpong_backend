import { NotificationType, RecipientType } from '../../../../../common/enum/user.enum';
import { NotificationDispatchService } from '../../../application/services/notification-dispatch.service';

describe('알림 발송 서비스', () => {
    it('포트로 알림 생성을 위임한다', async () => {
        const createNotificationUseCase = {
            execute: jest.fn().mockResolvedValue({ _id: 'notification-1' }),
        };
        const createNotificationFromBuilderUseCase = {
            execute: jest.fn(),
        };
        const sendNotificationEmailUseCase = {
            execute: jest.fn().mockReturnValue(true),
        };
        const service = new NotificationDispatchService(
            createNotificationUseCase,
            createNotificationFromBuilderUseCase,
            sendNotificationEmailUseCase,
        );

        await expect(
            service.createNotification(
                'user-1',
                'adopter',
                NotificationType.CONSULT_COMPLETED,
                { breederName: '행복브리더' },
                '/applications/app-1',
            ),
        ).resolves.toEqual({ _id: 'notification-1' });

        expect(createNotificationUseCase.execute).toHaveBeenCalledWith(
            'user-1',
            'adopter',
            NotificationType.CONSULT_COMPLETED,
            { breederName: '행복브리더' },
            '/applications/app-1',
        );
    });

    it('빌더가 생성/이메일 포트를 사용한다', async () => {
        const createNotificationUseCase = {
            execute: jest.fn(),
        };
        const createNotificationFromBuilderUseCase = {
            execute: jest.fn().mockResolvedValue({ notificationId: 'n-1' }),
        };
        const sendNotificationEmailUseCase = {
            execute: jest.fn().mockReturnValue(true),
        };
        const service = new NotificationDispatchService(
            createNotificationUseCase,
            createNotificationFromBuilderUseCase,
            sendNotificationEmailUseCase,
        );

        await service
            .to('breeder-1', RecipientType.BREEDER)
            .type(NotificationType.CONSULT_COMPLETED)
            .title('새 후기')
            .content('후기가 등록되었습니다.')
            .withEmail({
                to: 'breeder@test.com',
                subject: '새 후기',
                html: '<p>후기</p>',
            })
            .send();

        expect(createNotificationFromBuilderUseCase.execute).toHaveBeenCalled();
        expect(sendNotificationEmailUseCase.execute).toHaveBeenCalledWith({
            to: 'breeder@test.com',
            subject: '새 후기',
            html: '<p>후기</p>',
        });
    });
});
