import { Injectable } from '@nestjs/common';

import {
    buildAllNotificationsMarkedReadMessage,
    NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/notification-response-messages';

@Injectable()
export class NotificationReadResponseMessageService {
    notificationMarkedRead(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationMarkedRead;
    }

    allNotificationsMarkedRead(updatedCount: number): string {
        return buildAllNotificationsMarkedReadMessage(updatedCount);
    }
}
