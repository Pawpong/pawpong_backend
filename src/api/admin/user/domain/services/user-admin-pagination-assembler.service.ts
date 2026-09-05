import { Injectable } from '@nestjs/common';

import { buildPageResult } from '../../../../../common/types/page-result.type';
import type { PageResult } from '../../../../../common/types/page-result.type';

@Injectable()
export class UserAdminPaginationAssemblerService {
    build<T>(items: T[], page: number, limit: number, totalCount: number): PageResult<T> {
        return buildPageResult(items, page, limit, totalCount);
    }
}
