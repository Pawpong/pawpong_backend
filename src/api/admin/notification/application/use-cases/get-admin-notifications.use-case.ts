import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { NOTIFICATION_ADMIN_READER_PORT } from '../ports/notification-admin-reader.port';
import type { NotificationAdminReaderPort } from '../ports/notification-admin-reader.port';
import { NotificationAdminPageAssemblerService } from '../../domain/services/notification-admin-page-assembler.service';
import type { NotificationAdminListQuery } from '../types/notification-admin-query.type';
import type { NotificationAdminPageResult } from '../types/notification-admin-result.type';

@Injectable()
export class GetAdminNotificationsUseCase {
    constructor(
        @Inject(NOTIFICATION_ADMIN_READER_PORT)
        private readonly notificationAdminReader: NotificationAdminReaderPort,
        private readonly notificationAdminPageAssemblerService: NotificationAdminPageAssemblerService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(adminUserId: string, filter: NotificationAdminListQuery): Promise<NotificationAdminPageResult> {
        this.logger.logStart('getNotifications', '관리자 알림 목록 조회 시작', {
            adminUserId,
            filter,
        });

        try {
            const page = filter.pageNumber || 1;
            const limit = filter.itemsPerPage || 20;

            const result = await this.notificationAdminReader.findPaged({
                userId: filter.userId,
                userRole: filter.userRole,
                type: filter.type,
                isRead: filter.isRead,
                page,
                limit,
            });

            const response = this.notificationAdminPageAssemblerService.build(result, page, limit);

            this.logger.logSuccess('getNotifications', '관리자 알림 목록 조회 완료', {
                totalItems: result.totalItems,
                itemsReturned: result.items.length,
                page,
            });

            return response;
        } catch (error) {
            this.logger.logError('getNotifications', '관리자 알림 목록 조회 실패', error);
            throw error;
        }
    }
}
