import { BadRequestException } from '@nestjs/common';

import { NotificationType } from '../../../../../common/enum/user.enum';
import { NotificationMessageTemplateService } from '../../../domain/services/notification-message-template.service';
import { CreateNotificationUseCase } from '../../../application/use-cases/create-notification.use-case';

describe('알림 생성 유스케이스', () => {
    const notificationCommandPort = {
        create: jest.fn(),
    };

    const useCase = new CreateNotificationUseCase(
        notificationCommandPort as any,
        new NotificationMessageTemplateService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('템플릿과 메타데이터를 사용해 알림을 생성한다', async () => {
        const notification = {
            _id: { toString: () => 'notification-1' },
            type: NotificationType.CONSULT_COMPLETED,
            title: '행복브리더님과의 상담이 완료되었어요!',
            body: '어떠셨는지 후기를 남겨주세요.',
        };
        notificationCommandPort.create.mockResolvedValue(notification);

        const result = await useCase.execute(
            'user-1',
            'adopter',
            NotificationType.CONSULT_COMPLETED,
            { breederName: '행복브리더' },
            '/applications/app-1',
        );

        expect(notificationCommandPort.create).toHaveBeenCalledWith({
            userId: 'user-1',
            userRole: 'adopter',
            type: NotificationType.CONSULT_COMPLETED,
            title: '행복브리더님과의 상담이 완료되었어요!',
            body: '어떠셨는지 후기를 남겨주세요.',
            metadata: { breederName: '행복브리더' },
            targetUrl: '/applications/app-1',
            isRead: false,
        });
        expect(result).toBe(notification);
    });

    it('알 수 없는 타입이면 예외를 던진다', async () => {
        await expect(useCase.execute('user-1', 'adopter', 'unknown' as NotificationType)).rejects.toThrow(
            new BadRequestException('알 수 없는 알림 타입: unknown'),
        );
    });
});
