import { Injectable } from '@nestjs/common';

import { NotificationInboxRecord } from '../../application/ports/notification-inbox.port';
import type {
    NotificationReadResult,
    NotificationUnreadCountResult,
} from '../../application/types/notification-result.type';

@Injectable()
export class NotificationStateResultMapperService {
    toUnreadCountResult(unreadCount: number): NotificationUnreadCountResult {
        return { unreadCount };
    }

    toReadResult(notification: NotificationInboxRecord): NotificationReadResult {
        return {
            notificationId: notification._id.toString(),
            isRead: notification.isRead,
            readAt: notification.readAt!,
        };
    }
}
