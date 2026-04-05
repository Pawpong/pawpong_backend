import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import {
    MarkAsReadResponseDto,
    NotificationResponseDto,
    UnreadCountResponseDto,
} from '../../dto/response/notification-response.dto';
import { NotificationInboxRecord } from '../../application/ports/notification-inbox.port';

@Injectable()
export class NotificationResponseMapperService {
    toItem(notification: NotificationInboxRecord): NotificationResponseDto {
        return {
            notificationId: notification._id.toString(),
            type: notification.type,
            title: notification.title,
            body: notification.body,
            metadata: notification.metadata,
            isRead: notification.isRead,
            readAt: notification.readAt,
            targetUrl: notification.targetUrl,
            createdAt: notification.createdAt,
        };
    }

    toPage(
        notifications: NotificationInboxRecord[],
        page: number,
        limit: number,
        totalItems: number,
    ): PaginationResponseDto<NotificationResponseDto> {
        return new PaginationBuilder<NotificationResponseDto>()
            .setItems(notifications.map((notification) => this.toItem(notification)))
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(totalItems)
            .build();
    }

    toUnreadCount(unreadCount: number): UnreadCountResponseDto {
        return { unreadCount };
    }

    toReadResult(notification: NotificationInboxRecord): MarkAsReadResponseDto {
        return {
            notificationId: notification._id.toString(),
            isRead: notification.isRead,
            readAt: notification.readAt!,
        };
    }
}
