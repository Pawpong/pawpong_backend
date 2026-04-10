import { Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../common/types/page-result.type';

@Injectable()
export class BreederPaginationAssemblerService {
    build<T>(items: T[], page: number, limit: number, totalCount: number): PageResult<T> {
        return buildPageResult(items, page, limit, totalCount);
    }
}
