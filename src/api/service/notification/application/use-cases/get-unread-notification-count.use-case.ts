import { Inject, Injectable } from '@nestjs/common';

import { NOTIFICATION_INBOX_PORT } from '../ports/notification-inbox.port';
import type { NotificationInboxPort } from '../ports/notification-inbox.port';
import { NotificationStateResultMapperService } from '../../domain/services/notification-state-result-mapper.service';
import type { NotificationUnreadCountResult } from '../types/notification-result.type';

@Injectable()
export class GetUnreadNotificationCountUseCase {
    constructor(
        @Inject(NOTIFICATION_INBOX_PORT)
        private readonly notificationInboxPort: NotificationInboxPort,
        private readonly notificationStateResultMapperService: NotificationStateResultMapperService,
    ) {}

    async execute(userId: string): Promise<NotificationUnreadCountResult> {
        const unreadCount = await this.notificationInboxPort.countUnreadByUser(userId);
        return this.notificationStateResultMapperService.toUnreadCountResult(unreadCount);
    }
}
