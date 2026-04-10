import { Injectable } from '@nestjs/common';

import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notification-response-messages';

@Injectable()
export class NotificationListResponseMessageService {
    notificationsListed(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed;
    }
}
