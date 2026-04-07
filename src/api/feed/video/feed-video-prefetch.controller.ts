import { Param, Post, Query } from '@nestjs/common';

import { PrefetchAllQualitySegmentsUseCase } from './application/use-cases/prefetch-all-quality-segments.use-case';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { SegmentPrefetchResponseDto } from './dto/response/video-response.dto';
import { FeedVideoStreamHttpService } from './infrastructure/feed-video-stream-http.service';
import { ApiPrefetchFeedVideoSegmentsEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoPrefetchController {
    constructor(
        private readonly prefetchAllQualitySegmentsUseCase: PrefetchAllQualitySegmentsUseCase,
        private readonly feedVideoStreamHttpService: FeedVideoStreamHttpService,
    ) {}

    @Post('videos/stream/:videoId/prefetch')
    @ApiPrefetchFeedVideoSegmentsEndpoint()
    async prefetchSegments(
        @Param('videoId') videoId: string,
        @Query('segment') segment: number,
        @Query('count') count: number = 5,
    ): Promise<SegmentPrefetchResponseDto> {
        const requestedCount = Number(count);

        await this.prefetchAllQualitySegmentsUseCase.execute(videoId, Number(segment), requestedCount);
        return this.feedVideoStreamHttpService.buildPrefetchResponse(requestedCount);
    }
}
