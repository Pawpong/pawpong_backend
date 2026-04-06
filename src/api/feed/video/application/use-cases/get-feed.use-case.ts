import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedResponseDto } from '../../dto/response/video-response.dto';
import { FEED_VIDEO_READER, type FeedVideoReaderPort } from '../ports/feed-video-reader.port';
import { FeedVideoPresentationService } from '../../domain/services/feed-video-presentation.service';
import { FeedVideoAssetUrlService } from '../../infrastructure/feed-video-asset-url.service';

@Injectable()
export class GetFeedUseCase {
    constructor(
        @Inject(FEED_VIDEO_READER)
        private readonly feedVideoReader: FeedVideoReaderPort,
        private readonly feedVideoPresentationService: FeedVideoPresentationService,
        private readonly feedVideoAssetUrlService: FeedVideoAssetUrlService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async execute(page: number = 1, limit: number = 20): Promise<FeedResponseDto> {
        const cacheKey = `video:feed:${page}:${limit}`;
        const cached = await this.cacheManager.get<FeedResponseDto>(cacheKey);
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
