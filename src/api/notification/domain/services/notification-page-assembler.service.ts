import { Injectable } from '@nestjs/common';

import { NotificationInboxRecord } from '../../application/ports/notification-inbox.port';
import type { NotificationPageResult } from '../../application/types/notification-result.type';
import { NotificationPaginationAssemblerService } from './notification-pagination-assembler.service';
import { NotificationItemMapperService } from './notification-item-mapper.service';

@Injectable()
export class NotificationPageAssemblerService {
    constructor(
        private readonly notificationItemMapperService: NotificationItemMapperService,
        private readonly notificationPaginationAssemblerService: NotificationPaginationAssemblerService,
    ) {}

    build(
        notifications: NotificationInboxRecord[],
        page: number,
        limit: number,
        totalItems: number,
    ): NotificationPageResult {
        return this.notificationPaginationAssemblerService.build(
            notifications.map((notification) => this.notificationItemMapperService.toItem(notification)),
            page,
            limit,
            totalItems,
        );
    }
}
