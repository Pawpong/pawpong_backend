import { Inject, Injectable } from '@nestjs/common';

import { UnreadCountResponseDto } from '../../dto/response/notification-response.dto';
import { NOTIFICATION_INBOX_PORT } from '../ports/notification-inbox.port';
import type { NotificationInboxPort } from '../ports/notification-inbox.port';
import { NotificationStateResponseService } from '../../domain/services/notification-state-response.service';

@Injectable()
export class GetUnreadNotificationCountUseCase {
    constructor(
        @Inject(NOTIFICATION_INBOX_PORT)
        private readonly notificationInboxPort: NotificationInboxPort,
        private readonly notificationStateResponseService: NotificationStateResponseService,
    ) {}

    async execute(userId: string): Promise<UnreadCountResponseDto> {
        const unreadCount = await this.notificationInboxPort.countUnreadByUser(userId);
        return this.notificationStateResponseService.toUnreadCount(unreadCount);
    }
}
