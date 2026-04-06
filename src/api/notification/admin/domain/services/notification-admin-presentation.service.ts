import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../common/dto/pagination/pagination-builder.dto';
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

@Injectable()
export class NotificationAdminPresentationService {
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
        return new PaginationBuilder<NotificationAdminResponseDto>()
            .setItems(pageSnapshot.items.map((item) => this.toItem(item)))
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(pageSnapshot.totalItems)
            .build();
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
