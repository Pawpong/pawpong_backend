import { Inject, Injectable } from '@nestjs/common';

import { NOTIFICATION_INBOX_PORT } from '../ports/notification-inbox.port';
import type { NotificationInboxPort } from '../ports/notification-inbox.port';
import { NotificationPageAssemblerService } from '../../domain/services/notification-page-assembler.service';
import type { NotificationListQuery } from '../types/notification-query.type';
import type { NotificationPageResult } from '../types/notification-result.type';

@Injectable()
export class GetNotificationsUseCase {
    constructor(
        @Inject(NOTIFICATION_INBOX_PORT)
        private readonly notificationInboxPort: NotificationInboxPort,
        private readonly notificationPageAssemblerService: NotificationPageAssemblerService,
    ) {}

    async execute(
        userId: string,
        filter: NotificationListQuery,
    ): Promise<NotificationPageResult> {
        const page = filter.pageNumber || 1;
        const limit = filter.itemsPerPage || 20;

        const result = await this.notificationInboxPort.findPagedByUser(userId, {
            isRead: filter.isRead,
            page,
            limit,
        });

        return this.notificationPageAssemblerService.build(result.items, page, limit, result.totalItems);
    }
}
