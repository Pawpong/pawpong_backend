import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FEED_VIDEO_ASSET_URL_PORT, type FeedVideoAssetUrlPort } from '../ports/feed-video-asset-url.port';
import { FEED_VIDEO_READER_PORT, type FeedVideoReaderPort } from '../ports/feed-video-reader.port';
import { FeedVideoPublicListAssemblerService } from '../../domain/services/feed-video-public-list-assembler.service';
import type { FeedVideoFeedResult } from '../types/feed-video-result.type';

@Injectable()
export class GetFeedUseCase {
    constructor(
        @Inject(FEED_VIDEO_READER_PORT)
        private readonly feedVideoReader: FeedVideoReaderPort,
        private readonly feedVideoPublicListAssemblerService: FeedVideoPublicListAssemblerService,
        @Inject(FEED_VIDEO_ASSET_URL_PORT)
        private readonly feedVideoAssetUrlPort: FeedVideoAssetUrlPort,
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

        const result = await this.feedVideoPublicListAssemblerService.buildFeedResult(
            videos,
            page,
            limit,
            totalCount,
            (fileKey) => this.feedVideoAssetUrlPort.getSignedUrl(fileKey, 3000),
        );

        await this.cacheManager.set(cacheKey, result, 120000);
        return result;
    }
}
