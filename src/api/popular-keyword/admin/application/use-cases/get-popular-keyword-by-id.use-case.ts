import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PopularKeywordItemMapperService } from '../../../domain/services/popular-keyword-item-mapper.service';
import type { PopularKeywordItemResult } from '../../../application/types/popular-keyword-result.type';
import {
    POPULAR_KEYWORD_ADMIN_READER_PORT,
    type PopularKeywordAdminReaderPort,
} from '../ports/popular-keyword-admin-reader.port';

@Injectable()
export class GetPopularKeywordByIdUseCase {
    constructor(
        @Inject(POPULAR_KEYWORD_ADMIN_READER_PORT)
        private readonly reader: PopularKeywordAdminReaderPort,
        private readonly mapper: PopularKeywordItemMapperService,
    ) {}

    async execute(id: string): Promise<PopularKeywordItemResult> {
        const item = await this.reader.readById(id);

        if (!item) {
            throw new BadRequestException('인기 검색어를 찾을 수 없습니다.');
        }

        return this.mapper.toItem(item);
    }
}
