import { Injectable } from '@nestjs/common';

import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notification-response-messages';

@Injectable()
export class NotificationStatsResponseMessageService {
    notificationStatsRetrieved(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationStatsRetrieved;
    }
}
