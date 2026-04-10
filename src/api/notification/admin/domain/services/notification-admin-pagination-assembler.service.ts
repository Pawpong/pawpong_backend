import { Injectable } from '@nestjs/common';

import { buildPageResult } from '../../../../../common/types/page-result.type';
import type {
    NotificationAdminItemResult,
    NotificationAdminPageResult,
} from '../../application/types/notification-admin-result.type';

@Injectable()
export class NotificationAdminPaginationAssemblerService {
    build(
        items: NotificationAdminItemResult[],
        page: number,
        limit: number,
        totalItems: number,
    ): NotificationAdminPageResult {
        return buildPageResult(items, page, limit, totalItems);
    }
}
