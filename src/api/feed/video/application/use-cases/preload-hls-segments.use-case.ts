import { Inject, Injectable, Logger } from '@nestjs/common';

import { FEED_VIDEO_STREAM, type FeedVideoStreamPort } from '../ports/feed-video-stream.port';
import { FeedVideoSegmentTarget, FeedVideoStreamingService } from '../../domain/services/feed-video-streaming.service';

@Injectable()
export class PreloadHlsSegmentsUseCase {
    private readonly logger = new Logger(PreloadHlsSegmentsUseCase.name);

    constructor(
        @Inject(FEED_VIDEO_STREAM)
        private readonly feedVideoStream: FeedVideoStreamPort,
        private readonly feedVideoStreamingService: FeedVideoStreamingService,
    ) {}

    async execute(videoId: string, resolutions?: number[]): Promise<void> {
        for (const target of this.feedVideoStreamingService.getPreloadTargets(videoId, resolutions)) {
            await this.cacheSegmentIfMissing(target);
        }
    }

    private async cacheSegmentIfMissing(target: FeedVideoSegmentTarget): Promise<void> {
        try {
            const cached = await this.feedVideoStream.hasCache(target.cacheKey);
            if (cached) {
                return;
            }

            const buffer = await this.feedVideoStream.readFile(target.fileKey);
            await this.feedVideoStream.setBinaryCache(target.cacheKey, buffer, target.ttlSeconds);
            this.logger.debug(`[preloadHLSSegments] 프리로드 완료 - ${target.filename}`);
        } catch {
            this.logger.debug(`[preloadHLSSegments] 프리로드 스킵 - ${target.filename}`);
        }
    }
}
