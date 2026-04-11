import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FEED_VIDEO_READER_PORT, type FeedVideoReaderPort } from '../ports/feed-video-reader.port';
import { FeedVideoPresentationService } from '../../domain/services/feed-video-presentation.service';
import { FeedVideoAssetUrlService } from '../../infrastructure/feed-video-asset-url.service';
import type { FeedVideoFeedResult } from '../types/feed-video-result.type';

@Injectable()
export class GetFeedUseCase {
    constructor(
        @Inject(FEED_VIDEO_READER_PORT)
        private readonly feedVideoReader: FeedVideoReaderPort,
        private readonly feedVideoPresentationService: FeedVideoPresentationService,
        private readonly feedVideoAssetUrlService: FeedVideoAssetUrlService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(page: number = 1, limit: number = 20): Promise<FeedVideoFeedResult> {
        const cacheKey = this.feedCacheKeyService.getFeedKey(page, limit);
        const cached = await this.cacheManager.get<FeedVideoFeedResult>(cacheKey);
        if (cached) {
            return cached;
        }

        const skip = (page - 1) * limit;
        const [videos, totalCount] = await Promise.all([
            this.feedVideoReader.readPublicFeed(skip, limit),
            this.feedVideoReader.countPublicFeed(),
        ]);

        const result = await this.feedVideoPresentationService.buildFeedResponse(
            videos,
            page,
            limit,
            totalCount,
            (fileKey) => this.feedVideoAssetUrlService.getSignedUrlWithCache(fileKey, 3000),
        );

        await this.cacheManager.set(cacheKey, result, 120000);
        return result;
    }
}
