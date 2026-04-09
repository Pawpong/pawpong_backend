import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { NotificationAdminListRequestDto } from '../../dto/request/notification-admin-list-request.dto';
import { NotificationAdminResponseDto } from '../../dto/response/notification-admin-response.dto';
import { NOTIFICATION_ADMIN_READER } from '../ports/notification-admin-reader.port';
import type { NotificationAdminReaderPort } from '../ports/notification-admin-reader.port';
import { NotificationAdminListPresentationService } from '../../domain/services/notification-admin-list-presentation.service';

@Injectable()
export class GetAdminNotificationsUseCase {
    constructor(
        @Inject(NOTIFICATION_ADMIN_READER)
        private readonly notificationAdminReader: NotificationAdminReaderPort,
        private readonly notificationAdminListPresentationService: NotificationAdminListPresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        adminUserId: string,
        filter: NotificationAdminListRequestDto,
    ): Promise<PaginationResponseDto<NotificationAdminResponseDto>> {
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

            const response = this.notificationAdminListPresentationService.toPage(result, page, limit);

            this.logger.logSuccess('getNotifications', '관리자 알림 목록 조회 완료', {
                totalItems: result.totalItems,
                itemsReturned: result.items.length,
                page,
            });

            return response;
        } catch (error) {
            this.logger.logError('getNotifications', '관리자 알림 목록 조회 실패', error);
            throw new BadRequestException('알림 목록을 조회할 수 없습니다.');
        }
    }
}
