import { Inject, Injectable } from '@nestjs/common';

import { PopularKeywordItemMapperService } from '../../../domain/services/popular-keyword-item-mapper.service';
import type { PopularKeywordItemResult } from '../../../application/types/popular-keyword-result.type';
import {
    POPULAR_KEYWORD_ADMIN_READER_PORT,
    type PopularKeywordAdminReaderPort,
} from '../ports/popular-keyword-admin-reader.port';

@Injectable()
export class GetAllPopularKeywordsAdminUseCase {
    constructor(
        @Inject(POPULAR_KEYWORD_ADMIN_READER_PORT)
        private readonly reader: PopularKeywordAdminReaderPort,
        private readonly mapper: PopularKeywordItemMapperService,
    ) {}

    async execute(): Promise<PopularKeywordItemResult[]> {
        const items = await this.reader.readAll();
        return items.map((item) => this.mapper.toItem(item));
    }
}
