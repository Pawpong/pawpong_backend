import { Inject, Injectable } from '@nestjs/common';

import { EmailData } from '../../builder/notification.builder';
import { NOTIFICATION_EMAIL_PORT } from '../ports/notification-email.port';
import type { NotificationEmailPort } from '../ports/notification-email.port';

@Injectable()
export class SendNotificationEmailUseCase {
    constructor(
        @Inject(NOTIFICATION_EMAIL_PORT)
        private readonly notificationEmailPort: NotificationEmailPort,
    ) {}

    execute(emailData: EmailData): boolean {
        return this.notificationEmailPort.send(emailData);
    }
}
