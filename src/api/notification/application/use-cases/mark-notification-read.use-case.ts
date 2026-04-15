import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { NOTIFICATION_INBOX_PORT } from '../ports/notification-inbox.port';
import type { NotificationInboxPort } from '../ports/notification-inbox.port';
import { NotificationStateResultMapperService } from '../../domain/services/notification-state-result-mapper.service';
import type { NotificationReadResult } from '../types/notification-result.type';

@Injectable()
export class MarkNotificationReadUseCase {
    constructor(
        @Inject(NOTIFICATION_INBOX_PORT)
        private readonly notificationInboxPort: NotificationInboxPort,
        private readonly notificationStateResultMapperService: NotificationStateResultMapperService,
    ) {}

    async execute(userId: string, notificationId: string): Promise<NotificationReadResult> {
        const notification = await this.notificationInboxPort.markAsRead(userId, notificationId, new Date());
        if (!notification) {
            throw new DomainNotFoundError('알림을 찾을 수 없습니다.');
        }

        return this.notificationStateResultMapperService.toReadResult(notification);
    }
}
