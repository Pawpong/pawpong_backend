import { Injectable } from '@nestjs/common';

import type { NotificationMetadata } from '../../../../schema/notification.schema';
import { NotificationInboxRecord } from '../../application/ports/notification-inbox.port';
import { NotificationPaginationAssemblerService } from './notification-pagination-assembler.service';
import type { NotificationItemResult, NotificationPageResult } from '../../application/types/notification-result.type';
import type { NotificationObjectIdLike } from '../../types/notification-record.type';

type NotificationReadableRecord = {
    _id: NotificationObjectIdLike;
    type: NotificationInboxRecord['type'];
    title: string;
    body: string;
    metadata?: NotificationMetadata;
    isRead: boolean;
    readAt?: Date;
    targetUrl?: string;
    createdAt: Date;
};

@Injectable()
export class NotificationListPresentationService {
    constructor(private readonly notificationPaginationAssemblerService: NotificationPaginationAssemblerService) {}

    toItem(notification: NotificationReadableRecord): NotificationItemResult {
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
    ): NotificationPageResult {
        return this.notificationPaginationAssemblerService.build(
            notifications.map((notification) => this.toItem(notification)),
            page,
            limit,
            totalItems,
        );
    }
}
