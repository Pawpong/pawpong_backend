import { Injectable } from '@nestjs/common';

import { PopularKeywordSnapshot } from '../../application/ports/popular-keyword-reader.port';
import type { PopularKeywordItemResult } from '../../application/types/popular-keyword-result.type';

@Injectable()
export class PopularKeywordItemMapperService {
    toItem(item: PopularKeywordSnapshot): PopularKeywordItemResult {
        return {
            keywordId: item.id,
            keyword: item.keyword,
            rank: item.rank,
            isActive: item.isActive,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
        };
    }
}
