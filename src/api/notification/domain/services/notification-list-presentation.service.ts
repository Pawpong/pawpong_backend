import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { NotificationResponseDto } from '../../dto/response/notification-response.dto';
import { NotificationInboxRecord } from '../../application/ports/notification-inbox.port';
import { NotificationPaginationAssemblerService } from './notification-pagination-assembler.service';

type NotificationReadableRecord = {
    _id: { toString(): string };
    type: NotificationInboxRecord['type'];
    title: string;
    body: string;
    metadata?: Record<string, any>;
    isRead: boolean;
    readAt?: Date;
    targetUrl?: string;
    createdAt: Date;
};

@Injectable()
export class NotificationListPresentationService {
    constructor(private readonly notificationPaginationAssemblerService: NotificationPaginationAssemblerService) {}

    toItem(notification: NotificationReadableRecord): NotificationResponseDto {
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
        return this.notificationPaginationAssemblerService.build(
            notifications.map((notification) => this.toItem(notification)),
            page,
            limit,
            totalItems,
        );
    }
}
