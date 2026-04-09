import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import {
    NotificationAdminResponseDto,
    NotificationStatsResponseDto,
} from '../../dto/response/notification-admin-response.dto';
import {
    NotificationAdminPageSnapshot,
    NotificationAdminRecordSnapshot,
    NotificationAdminStatsSnapshot,
} from '../../application/ports/notification-admin-reader.port';
import { NotificationAdminPaginationAssemblerService } from './notification-admin-pagination-assembler.service';

@Injectable()
export class NotificationAdminPresentationService {
    constructor(
        private readonly notificationAdminPaginationAssemblerService: NotificationAdminPaginationAssemblerService,
    ) {}

    toItem(record: NotificationAdminRecordSnapshot): NotificationAdminResponseDto {
        return {
            notificationId: record.notificationId,
            userId: record.userId,
            userRole: record.userRole,
            type: record.type,
            title: record.title,
            body: record.body,
            metadata: record.metadata,
            isRead: record.isRead,
            readAt: record.readAt,
            targetUrl: record.targetUrl,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }

    toPage(
        pageSnapshot: NotificationAdminPageSnapshot,
        page: number,
        limit: number,
    ): PaginationResponseDto<NotificationAdminResponseDto> {
        return this.notificationAdminPaginationAssemblerService.build(
            pageSnapshot.items.map((item) => this.toItem(item)),
            page,
            limit,
            pageSnapshot.totalItems,
        );
    }

    toStats(snapshot: NotificationAdminStatsSnapshot): NotificationStatsResponseDto {
        return {
            totalNotifications: snapshot.totalNotifications,
            unreadNotifications: snapshot.unreadNotifications,
            notificationsByType: snapshot.notificationsByType,
            notificationsByRole: snapshot.notificationsByRole,
        };
    }
}
