import { Inject, Injectable } from '@nestjs/common';

import { MarkAllAsReadResponseDto } from '../../dto/response/notification-response.dto';
import { NOTIFICATION_INBOX_PORT } from '../ports/notification-inbox.port';
import type { NotificationInboxPort } from '../ports/notification-inbox.port';

@Injectable()
export class MarkAllNotificationsReadUseCase {
    constructor(
        @Inject(NOTIFICATION_INBOX_PORT)
        private readonly notificationInboxPort: NotificationInboxPort,
    ) {}

    async execute(userId: string): Promise<MarkAllAsReadResponseDto> {
        const updatedCount = await this.notificationInboxPort.markAllAsRead(userId, new Date());
        return { updatedCount };
    }
}
