import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { MarkAsReadResponseDto } from '../../dto/response/notification-response.dto';
import { NOTIFICATION_INBOX_PORT } from '../ports/notification-inbox.port';
import type { NotificationInboxPort } from '../ports/notification-inbox.port';
import { NotificationResponseMapperService } from '../../domain/services/notification-response-mapper.service';

@Injectable()
export class MarkNotificationReadUseCase {
    constructor(
        @Inject(NOTIFICATION_INBOX_PORT)
        private readonly notificationInboxPort: NotificationInboxPort,
        private readonly notificationResponseMapperService: NotificationResponseMapperService,
    ) {}

    async execute(userId: string, notificationId: string): Promise<MarkAsReadResponseDto> {
        const notification = await this.notificationInboxPort.markAsRead(userId, notificationId, new Date());
        if (!notification) {
            throw new NotFoundException('알림을 찾을 수 없습니다.');
        }

        return this.notificationResponseMapperService.toReadResult(notification);
    }
}
