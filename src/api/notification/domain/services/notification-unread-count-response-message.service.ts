import { Injectable } from '@nestjs/common';

import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notification-response-messages';

@Injectable()
export class NotificationUnreadCountResponseMessageService {
    unreadCountRetrieved(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.unreadCountRetrieved;
    }
}
