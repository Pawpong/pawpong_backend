import { Injectable } from '@nestjs/common';

import { MarkAsReadResponseDto, UnreadCountResponseDto } from '../../dto/response/notification-response.dto';
import { NotificationInboxRecord } from '../../application/ports/notification-inbox.port';

@Injectable()
export class NotificationStateResponseService {
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
