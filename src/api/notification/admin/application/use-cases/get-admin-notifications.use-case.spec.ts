import { BadRequestException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { NotificationType } from '../../../../../schema/notification.schema';
import { NotificationAdminPresentationService } from '../../domain/services/notification-admin-presentation.service';
import { NotificationAdminReaderPort } from '../ports/notification-admin-reader.port';
import { GetAdminNotificationsUseCase } from './get-admin-notifications.use-case';

describe('GetAdminNotificationsUseCase', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    it('알림 목록을 페이지 응답으로 변환한다', async () => {
        const reader: NotificationAdminReaderPort = {
            findPaged: jest.fn().mockResolvedValue({
                items: [
                    {
                        notificationId: 'noti-1',
                        userId: 'user-1',
                        userRole: 'adopter',
                        type: NotificationType.NEW_CONSULT_REQUEST,
                        title: '새 상담',
                        body: '상담이 도착했습니다.',
                        isRead: false,
                        createdAt: new Date('2026-04-06T00:00:00.000Z'),
                        updatedAt: new Date('2026-04-06T00:00:00.000Z'),
                    },
                ],
                totalItems: 1,
            }),
            getStats: jest.fn(),
        };
        const useCase = new GetAdminNotificationsUseCase(
            reader,
            new NotificationAdminPresentationService(),
            logger,
        );

        await expect(
            useCase.execute('admin-1', {
                pageNumber: 1,
                itemsPerPage: 20,
            }),
        ).resolves.toMatchObject({
            items: [
                {
                    notificationId: 'noti-1',
                    userId: 'user-1',
                    type: NotificationType.NEW_CONSULT_REQUEST,
                },
            ],
            pagination: {
                currentPage: 1,
                pageSize: 20,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
            },
        });
    });

    it('조회 실패 시 BadRequestException으로 감싼다', async () => {
        const useCase = new GetAdminNotificationsUseCase(
            {
                findPaged: jest.fn().mockRejectedValue(new Error('boom')),
                getStats: jest.fn(),
            },
            new NotificationAdminPresentationService(),
            logger,
        );

        await expect(
            useCase.execute('admin-1', {
                pageNumber: 1,
                itemsPerPage: 20,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
