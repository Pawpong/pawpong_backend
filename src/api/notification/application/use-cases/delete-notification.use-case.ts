import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { NOTIFICATION_INBOX_PORT } from '../ports/notification-inbox.port';
import type { NotificationInboxPort } from '../ports/notification-inbox.port';

@Injectable()
export class DeleteNotificationUseCase {
    constructor(
        @Inject(NOTIFICATION_INBOX_PORT)
        private readonly notificationInboxPort: NotificationInboxPort,
    ) {}

    async execute(userId: string, notificationId: string): Promise<void> {
        const deletedCount = await this.notificationInboxPort.deleteForUser(userId, notificationId);
        if (deletedCount === 0) {
            throw new DomainNotFoundError('알림을 찾을 수 없습니다.');
        }
    }
}
