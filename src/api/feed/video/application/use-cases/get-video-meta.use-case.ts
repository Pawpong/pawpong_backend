import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FEED_VIDEO_READER, type FeedVideoReaderPort } from '../ports/feed-video-reader.port';
import { FeedVideoPresentationService } from '../../domain/services/feed-video-presentation.service';
import { FeedVideoAssetUrlService } from '../../infrastructure/feed-video-asset-url.service';
import { VideoStatus } from '../../../../../schema/video.schema';

@Injectable()
export class GetVideoMetaUseCase {
    constructor(
        @Inject(FEED_VIDEO_READER)
        private readonly feedVideoReader: FeedVideoReaderPort,
        private readonly feedVideoPresentationService: FeedVideoPresentationService,
        private readonly feedVideoAssetUrlService: FeedVideoAssetUrlService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(videoId: string): Promise<any> {
        const cacheKey = this.feedCacheKeyService.getVideoMetaKey(videoId);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }

        const video = await this.feedVideoReader.readById(videoId);
        if (!video) {
            throw new BadRequestException('동영상을 찾을 수 없습니다.');
        }

        if (video.status !== VideoStatus.READY) {
            return this.feedVideoPresentationService.buildPendingMetaResponse(video);
        }

        const result = await this.feedVideoPresentationService.buildMetaResponse(
            video,
            (fileKey) => this.feedVideoAssetUrlService.getSignedUrlWithCache(fileKey, 3000),
        );

        await this.cacheManager.set(cacheKey, result, 300000);
        return result;
    }
}
