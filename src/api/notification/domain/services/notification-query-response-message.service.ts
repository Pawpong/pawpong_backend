import { Injectable } from '@nestjs/common';

import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notification-response-messages';

@Injectable()
export class NotificationQueryResponseMessageService {
    notificationsListed(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed;
    }

    unreadCountRetrieved(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.unreadCountRetrieved;
    }

    notificationStatsRetrieved(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationStatsRetrieved;
    }
}
