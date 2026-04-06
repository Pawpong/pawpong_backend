import { Injectable, Logger } from '@nestjs/common';

import { SearchByTagUseCase } from './application/use-cases/search-by-tag.use-case';
import { GetPopularTagsUseCase } from './application/use-cases/get-popular-tags.use-case';
import { SuggestTagsUseCase } from './application/use-cases/suggest-tags.use-case';

/**
 * 피드 태그 서비스
 * - 해시태그 검색
 * - 인기 태그 조회
 * - 태그 자동완성
 */
@Injectable()
export class FeedTagService {
    private readonly logger = new Logger(FeedTagService.name);

    constructor(
        private readonly searchByTagUseCase: SearchByTagUseCase,
        private readonly getPopularTagsUseCase: GetPopularTagsUseCase,
        private readonly suggestTagsUseCase: SuggestTagsUseCase,
    ) {}

    /**
     * 해시태그로 동영상 검색
     */
    async searchByTag(tag: string, page: number = 1, limit: number = 20) {
        this.logger.log(`[searchByTag] 태그 검색 - tag: ${tag}`);
        return this.searchByTagUseCase.execute(tag, page, limit);
    }

    /**
     * 인기 해시태그 목록
     */
    async getPopularTags(limit: number = 20) {
        this.logger.log(`[getPopularTags] 인기 태그 조회`);
        return this.getPopularTagsUseCase.execute(limit);
    }

    /**
     * 태그 자동완성 (검색창)
     */
    async suggestTags(query: string, limit: number = 10) {
        this.logger.log(`[suggestTags] 태그 자동완성 - query: ${query}`);
        return this.suggestTagsUseCase.execute(query, limit);
    }
}
