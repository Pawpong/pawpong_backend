import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { NOTIFICATION_INBOX_PORT } from '../ports/notification-inbox.port';
import type { NotificationInboxPort } from '../ports/notification-inbox.port';
import { NotificationStateResponseService } from '../../domain/services/notification-state-response.service';
import type { NotificationReadResult } from '../types/notification-result.type';

@Injectable()
export class MarkNotificationReadUseCase {
    constructor(
        @Inject(NOTIFICATION_INBOX_PORT)
        private readonly notificationInboxPort: NotificationInboxPort,
        private readonly notificationStateResponseService: NotificationStateResponseService,
    ) {}

    async execute(userId: string, notificationId: string): Promise<NotificationReadResult> {
        const notification = await this.notificationInboxPort.markAsRead(userId, notificationId, new Date());
        if (!notification) {
            throw new NotFoundException('알림을 찾을 수 없습니다.');
        }

        return this.notificationStateResponseService.toReadResult(notification);
    }
}
