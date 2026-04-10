import { Injectable } from '@nestjs/common';

import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notification-response-messages';

@Injectable()
export class NotificationDeleteResponseMessageService {
    notificationDeleted(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationDeleted;
    }
}
