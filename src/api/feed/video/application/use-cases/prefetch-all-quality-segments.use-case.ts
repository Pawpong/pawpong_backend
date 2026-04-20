import { Inject, Injectable, Logger } from '@nestjs/common';

import { FEED_VIDEO_STREAM_PORT, type FeedVideoStreamPort } from '../ports/feed-video-stream.port';
import { FeedVideoSegmentTarget, FeedVideoStreamingService } from '../../domain/services/feed-video-streaming.service';

@Injectable()
export class PrefetchAllQualitySegmentsUseCase {
    private readonly logger = new Logger(PrefetchAllQualitySegmentsUseCase.name);

    constructor(
        @Inject(FEED_VIDEO_STREAM_PORT)
        private readonly feedVideoStream: FeedVideoStreamPort,
        private readonly feedVideoStreamingService: FeedVideoStreamingService,
    ) {}

    async execute(
        videoId: string,
        currentSegment: number,
        count: number = 5,
        resolutions?: number[],
    ): Promise<number> {
        const targets = this.feedVideoStreamingService.getPrefetchTargets(videoId, currentSegment, count, resolutions);

        await Promise.allSettled(targets.map((target) => this.cacheSegmentIfMissing(target)));

        return targets.length;
    }

    private async cacheSegmentIfMissing(target: FeedVideoSegmentTarget): Promise<void> {
        try {
            const cached = await this.feedVideoStream.hasCache(target.cacheKey);
            if (cached) {
                this.logger.debug(`[prefetchAllQualitySegments] 이미 캐시됨 - ${target.filename}`);
                return;
            }

            const buffer = await this.feedVideoStream.readFile(target.fileKey);
            await this.feedVideoStream.setBinaryCache(target.cacheKey, buffer, target.ttlSeconds);
            this.logger.debug(`[prefetchAllQualitySegments] 프리페치 완료 - ${target.filename}`);
        } catch {
            this.logger.debug(`[prefetchAllQualitySegments] 프리페치 스킵 - ${target.filename}`);
        }
    }
}
