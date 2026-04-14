import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FEED_VIDEO_ASSET_URL_PORT, type FeedVideoAssetUrlPort } from '../ports/feed-video-asset-url.port';
import { FEED_VIDEO_READER_PORT, type FeedVideoReaderPort } from '../ports/feed-video-reader.port';
import { FeedVideoPublicListAssemblerService } from '../../domain/services/feed-video-public-list-assembler.service';
import type { FeedPopularVideoItemResult } from '../types/feed-video-result.type';

@Injectable()
export class GetPopularVideosUseCase {
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

    async execute(limit: number = 10): Promise<FeedPopularVideoItemResult[]> {
        const cacheKey = this.feedCacheKeyService.getPopularVideosKey(limit);
        const cached = await this.cacheManager.get<FeedPopularVideoItemResult[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const videos = await this.feedVideoReader.readPopular(limit);
        const result = await this.feedVideoPublicListAssemblerService.buildPopularResult(videos, (fileKey) =>
            this.feedVideoAssetUrlPort.getSignedUrl(fileKey, 3000),
        );

        await this.cacheManager.set(cacheKey, result, 600000);
        return result;
    }
}
