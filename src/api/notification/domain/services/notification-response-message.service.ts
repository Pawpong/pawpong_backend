import { Injectable } from '@nestjs/common';
import {
    buildAllNotificationsMarkedReadMessage,
    NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/notification-response-messages';

@Injectable()
export class NotificationResponseMessageService {
    notificationsListed(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed;
    }

    unreadCountRetrieved(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.unreadCountRetrieved;
    }

    notificationMarkedRead(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationMarkedRead;
    }

    allNotificationsMarkedRead(updatedCount: number): string {
        return buildAllNotificationsMarkedReadMessage(updatedCount);
    }

    notificationDeleted(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationDeleted;
    }

    notificationStatsRetrieved(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationStatsRetrieved;
    }
}
