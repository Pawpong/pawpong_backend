import { Injectable } from '@nestjs/common';

import { buildPageResult } from '../../../../common/types/page-result.type';
import type { NoticeItemResult, NoticePageResult } from '../../application/types/notice-result.type';

@Injectable()
export class NoticePaginationAssemblerService {
    build(items: NoticeItemResult[], page: number, limit: number, totalItems: number): NoticePageResult {
        return buildPageResult(items, page, limit, totalItems);
    }
}
