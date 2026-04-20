import { Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../common/types/page-result.type';
import type { AnnouncementResult } from '../../application/types/announcement-result.type';

@Injectable()
export class AnnouncementPaginationAssemblerService {
    build(
        items: AnnouncementResult[],
        page: number,
        limit: number,
        totalCount: number,
    ): PageResult<AnnouncementResult> {
        return buildPageResult(items, page, limit, totalCount);
    }
}
