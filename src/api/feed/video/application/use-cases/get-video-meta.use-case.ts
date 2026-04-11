import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FEED_VIDEO_READER_PORT, type FeedVideoReaderPort } from '../ports/feed-video-reader.port';
import { FeedVideoMetaAssemblerService } from '../../domain/services/feed-video-meta-assembler.service';
import { FeedVideoAssetUrlService } from '../../infrastructure/feed-video-asset-url.service';
import { VideoStatus } from '../../../../../schema/video.schema';
import type { FeedVideoMetaQueryResult } from '../types/feed-video-result.type';

@Injectable()
export class GetVideoMetaUseCase {
    constructor(
        @Inject(FEED_VIDEO_READER_PORT)
        private readonly feedVideoReader: FeedVideoReaderPort,
        private readonly feedVideoMetaAssemblerService: FeedVideoMetaAssemblerService,
        private readonly feedVideoAssetUrlService: FeedVideoAssetUrlService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(videoId: string): Promise<FeedVideoMetaQueryResult> {
        const cacheKey = this.feedCacheKeyService.getVideoMetaKey(videoId);
        const cached = await this.cacheManager.get<FeedVideoMetaQueryResult>(cacheKey);
        if (cached) {
            return cached;
        }

        const video = await this.feedVideoReader.readById(videoId);
        if (!video) {
            throw new BadRequestException('동영상을 찾을 수 없습니다.');
        }

        if (video.status !== VideoStatus.READY) {
            return this.feedVideoMetaAssemblerService.buildPendingMetaResult(video);
        }

        const result = await this.feedVideoMetaAssemblerService.buildMetaResult(
            video,
            (fileKey) => this.feedVideoAssetUrlService.getSignedUrlWithCache(fileKey, 3000),
        );

        await this.cacheManager.set(cacheKey, result, 300000);
        return result;
    }
}
