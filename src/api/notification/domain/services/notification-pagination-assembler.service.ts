import { Injectable } from '@nestjs/common';

import { buildPageResult } from '../../../../common/types/page-result.type';
import type { NotificationItemResult, NotificationPageResult } from '../../application/types/notification-result.type';

@Injectable()
export class NotificationPaginationAssemblerService {
    build(items: NotificationItemResult[], page: number, limit: number, totalItems: number): NotificationPageResult {
        return buildPageResult(items, page, limit, totalItems);
    }
}
