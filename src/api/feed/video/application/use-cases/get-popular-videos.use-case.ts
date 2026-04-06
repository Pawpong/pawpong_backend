import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FEED_VIDEO_READER, type FeedVideoReaderPort } from '../ports/feed-video-reader.port';
import { FeedVideoPresentationService } from '../../domain/services/feed-video-presentation.service';
import { FeedVideoAssetUrlService } from '../../infrastructure/feed-video-asset-url.service';

@Injectable()
export class GetPopularVideosUseCase {
    constructor(
        @Inject(FEED_VIDEO_READER)
        private readonly feedVideoReader: FeedVideoReaderPort,
        private readonly feedVideoPresentationService: FeedVideoPresentationService,
        private readonly feedVideoAssetUrlService: FeedVideoAssetUrlService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async execute(limit: number = 10): Promise<any[]> {
        const cacheKey = `video:popular:${limit}`;
        const cached = await this.cacheManager.get<any[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const videos = await this.feedVideoReader.readPopular(limit);
        const result = await this.feedVideoPresentationService.buildPopularResponse(videos, (fileKey) =>
            this.feedVideoAssetUrlService.getSignedUrlWithCache(fileKey, 3000),
        );

        await this.cacheManager.set(cacheKey, result, 600000);
        return result;
    }
}
