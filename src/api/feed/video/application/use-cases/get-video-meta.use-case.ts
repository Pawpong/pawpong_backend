import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { VideoStatus } from '../../../../../common/enum/video-status.enum';
import { FEED_VIDEO_ASSET_URL_PORT, type FeedVideoAssetUrlPort } from '../ports/feed-video-asset-url.port';
import { FEED_VIDEO_READER_PORT, type FeedVideoReaderPort } from '../ports/feed-video-reader.port';
import { FeedVideoMetaAssemblerService } from '../../domain/services/feed-video-meta-assembler.service';
import type { FeedVideoMetaQueryResult } from '../types/feed-video-result.type';

@Injectable()
export class GetVideoMetaUseCase {
    constructor(
        @Inject(FEED_VIDEO_READER_PORT)
        private readonly feedVideoReader: FeedVideoReaderPort,
        private readonly feedVideoMetaAssemblerService: FeedVideoMetaAssemblerService,
        @Inject(FEED_VIDEO_ASSET_URL_PORT)
        private readonly feedVideoAssetUrlPort: FeedVideoAssetUrlPort,
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
            throw new DomainNotFoundError('동영상을 찾을 수 없습니다.');
        }

        if (video.status !== VideoStatus.READY) {
            return this.feedVideoMetaAssemblerService.buildPendingMetaResult(video);
        }

        const result = await this.feedVideoMetaAssemblerService.buildMetaResult(video, (fileKey) =>
            this.feedVideoAssetUrlPort.getSignedUrl(fileKey, 3000),
        );

        await this.cacheManager.set(cacheKey, result, 300000);
        return result;
    }
}
