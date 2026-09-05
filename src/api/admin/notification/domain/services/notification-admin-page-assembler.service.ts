import { Injectable } from '@nestjs/common';

import { NotificationAdminPageSnapshot } from '../../application/ports/notification-admin-reader.port';
import type { NotificationAdminPageResult } from '../../application/types/notification-admin-result.type';
import { NotificationAdminItemMapperService } from './notification-admin-item-mapper.service';
import { NotificationAdminPaginationAssemblerService } from './notification-admin-pagination-assembler.service';

@Injectable()
export class NotificationAdminPageAssemblerService {
    constructor(
        private readonly notificationAdminItemMapperService: NotificationAdminItemMapperService,
        private readonly notificationAdminPaginationAssemblerService: NotificationAdminPaginationAssemblerService,
    ) {}

    build(pageSnapshot: NotificationAdminPageSnapshot, page: number, limit: number): NotificationAdminPageResult {
        return this.notificationAdminPaginationAssemblerService.build(
            pageSnapshot.items.map((item) => this.notificationAdminItemMapperService.toItem(item)),
            page,
            limit,
            pageSnapshot.totalItems,
        );
    }
}
