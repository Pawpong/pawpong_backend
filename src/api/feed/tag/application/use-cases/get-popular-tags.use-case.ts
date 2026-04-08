import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { PopularTagItemDto } from '../../dto/response/tag-response.dto';
import { FEED_TAG_READER, type FeedTagReaderPort } from '../ports/feed-tag-reader.port';

@Injectable()
export class GetPopularTagsUseCase {
    constructor(
        @Inject(FEED_TAG_READER)
        private readonly feedTagReader: FeedTagReaderPort,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(limit: number = 20): Promise<PopularTagItemDto[]> {
        const cacheKey = this.feedCacheKeyService.getPopularTagsKey(limit);
        const cached = await this.cacheManager.get<PopularTagItemDto[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const result = await this.feedTagReader.readPopularTags(limit);
        await this.cacheManager.set(cacheKey, result, 600000);
        return result;
    }
}
