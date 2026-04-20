import { Injectable } from '@nestjs/common';

import { NotificationInboxRecord } from '../../application/ports/notification-inbox.port';
import type { NotificationItemResult } from '../../application/types/notification-result.type';
import type { NotificationMetadata } from '../../types/notification-metadata.type';
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
export class NotificationItemMapperService {
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
}
