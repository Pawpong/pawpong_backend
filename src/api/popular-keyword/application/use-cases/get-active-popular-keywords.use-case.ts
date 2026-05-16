import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { PopularKeywordItemMapperService } from '../../domain/services/popular-keyword-item-mapper.service';
import { POPULAR_KEYWORD_READER_PORT, type PopularKeywordReaderPort } from '../ports/popular-keyword-reader.port';
import type { PopularKeywordItemResult } from '../types/popular-keyword-result.type';

@Injectable()
export class GetActivePopularKeywordsUseCase {
    constructor(
        @Inject(POPULAR_KEYWORD_READER_PORT)
        private readonly reader: PopularKeywordReaderPort,
        private readonly mapper: PopularKeywordItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(): Promise<PopularKeywordItemResult[]> {
        this.logger.logStart('getActivePopularKeywords', '활성 인기 검색어 조회 시작');

        try {
            const items = await this.reader.readActiveAll();
            const result = items.map((item) => this.mapper.toItem(item));

            this.logger.logSuccess('getActivePopularKeywords', '활성 인기 검색어 조회 완료', { count: result.length });
            return result;
        } catch (error) {
            this.logger.logError('getActivePopularKeywords', '활성 인기 검색어 조회', error);
            throw error;
        }
    }
}
