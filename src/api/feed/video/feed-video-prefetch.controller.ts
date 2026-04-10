import { Param, Post, Query } from '@nestjs/common';

import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { PrefetchAllQualitySegmentsUseCase } from './application/use-cases/prefetch-all-quality-segments.use-case';
import type { FeedVideoSegmentPrefetchResult } from './application/types/feed-video-result.type';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { FeedPrefetchQueryDto } from './dto/request/feed-prefetch-query.dto';
import { SegmentPrefetchResponseDto } from './dto/response/video-response.dto';
import { FeedVideoPrefetchPresentationService } from './infrastructure/feed-video-prefetch-presentation.service';
import { ApiPrefetchFeedVideoSegmentsEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoPrefetchController {
    constructor(
        private readonly prefetchAllQualitySegmentsUseCase: PrefetchAllQualitySegmentsUseCase,
        private readonly feedVideoPrefetchPresentationService: FeedVideoPrefetchPresentationService,
    ) {}

    @Post('videos/stream/:videoId/prefetch')
    @ApiPrefetchFeedVideoSegmentsEndpoint()
    async prefetchSegments(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @Query() query: FeedPrefetchQueryDto,
    ): Promise<SegmentPrefetchResponseDto> {
        const requestedCount = query.count;

        await this.prefetchAllQualitySegmentsUseCase.execute(videoId, query.segment, requestedCount);
        return this.feedVideoPrefetchPresentationService.buildResponse(requestedCount) as
            SegmentPrefetchResponseDto & FeedVideoSegmentPrefetchResult;
    }
}
