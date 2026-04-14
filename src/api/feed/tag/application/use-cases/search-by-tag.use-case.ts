import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FeedTagSearchResultAssemblerService } from '../../domain/services/feed-tag-search-result-assembler.service';
import { FeedTagNormalizerService } from '../../domain/services/feed-tag-normalizer.service';
import { FEED_TAG_ASSET_URL_PORT, type FeedTagAssetUrlPort } from '../ports/feed-tag-asset-url.port';
import { FEED_TAG_READER_PORT, type FeedTagReaderPort } from '../ports/feed-tag-reader.port';
import type { FeedTagSearchResult } from '../types/feed-tag-result.type';

@Injectable()
export class SearchByTagUseCase {
    constructor(
        @Inject(FEED_TAG_READER_PORT)
        private readonly feedTagReader: FeedTagReaderPort,
        private readonly feedTagNormalizerService: FeedTagNormalizerService,
        private readonly feedTagSearchResultAssemblerService: FeedTagSearchResultAssemblerService,
        @Inject(FEED_TAG_ASSET_URL_PORT)
        private readonly feedTagAssetUrl: FeedTagAssetUrlPort,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(tag: string, page: number = 1, limit: number = 20): Promise<FeedTagSearchResult> {
        const cleanTag = this.feedTagNormalizerService.normalizeTag(tag);

        if (!cleanTag) {
            throw new BadRequestException('검색할 태그를 입력해주세요.');
        }

        const cacheKey = this.feedCacheKeyService.getTagSearchKey(cleanTag, page, limit);
        const cached = await this.cacheManager.get<FeedTagSearchResult>(cacheKey);
        if (cached) {
            return cached;
        }

        const skip = (page - 1) * limit;
        const [videos, totalCount] = await Promise.all([
            this.feedTagReader.readByTag(cleanTag, skip, limit),
            this.feedTagReader.countByTag(cleanTag),
        ]);

        const result = await this.feedTagSearchResultAssemblerService.buildSearchResponse(
            videos,
            cleanTag,
            page,
            limit,
            totalCount,
            (fileKey) => (fileKey ? this.feedTagAssetUrl.generateSignedUrl(fileKey, 50) : null),
        );

        await this.cacheManager.set(cacheKey, result, 300000);
        return result;
    }
}
