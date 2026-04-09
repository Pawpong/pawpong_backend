import { BadRequestException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { NotificationAdminPresentationService } from '../../domain/services/notification-admin-presentation.service';
import { NotificationAdminReaderPort } from '../ports/notification-admin-reader.port';
import { GetNotificationAdminStatsUseCase } from './get-notification-admin-stats.use-case';

describe('관리자 알림 통계 조회 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    it('알림 통계를 그대로 응답으로 변환한다', async () => {
        const reader: NotificationAdminReaderPort = {
            findPaged: jest.fn(),
            getStats: jest.fn().mockResolvedValue({
                totalNotifications: 10,
                unreadNotifications: 3,
                notificationsByType: {
                    NEW_CONSULT_REQUEST: 4,
                },
                notificationsByRole: {
                    adopter: 6,
                    breeder: 4,
                },
            }),
        };
        const useCase = new GetNotificationAdminStatsUseCase(
            reader,
            new NotificationAdminPresentationService(),
            logger,
        );

        await expect(useCase.execute('admin-1')).resolves.toEqual({
            totalNotifications: 10,
            unreadNotifications: 3,
            notificationsByType: {
                NEW_CONSULT_REQUEST: 4,
            },
            notificationsByRole: {
                adopter: 6,
                breeder: 4,
            },
        });
    });

    it('통계 조회 실패 시 예외으로 감싼다', async () => {
        const useCase = new GetNotificationAdminStatsUseCase(
            {
                findPaged: jest.fn(),
                getStats: jest.fn().mockRejectedValue(new Error('boom')),
            },
            new NotificationAdminPresentationService(),
            logger,
        );

        await expect(useCase.execute('admin-1')).rejects.toBeInstanceOf(BadRequestException);
    });
});
