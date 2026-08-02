import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES } from '../constants/feed-video-response-messages';
import { Param, Post, Query } from '@nestjs/common';

import { MongoObjectIdPipe } from '../../../../../common/pipe/mongo-object-id.pipe';
import { PrefetchAllQualitySegmentsUseCase } from '../application/use-cases/prefetch-all-quality-segments.use-case';
import type { FeedVideoSegmentPrefetchResult } from '../application/types/feed-video-result.type';
import { FeedPublicController } from '../decorator/feed-video-controller.decorator';
import { FeedPrefetchQueryDto } from '../dto/request/feed-prefetch-query.dto';
import { SegmentPrefetchResponseDto } from '../dto/response/video-response.dto';
import { ApiPrefetchFeedVideoSegmentsEndpoint } from '../swagger/index';

@FeedPublicController()
export class FeedVideoPrefetchController {
    constructor(private readonly prefetchAllQualitySegmentsUseCase: PrefetchAllQualitySegmentsUseCase) {}

    @Post('videos/stream/:videoId/prefetch')
    @ApiPrefetchFeedVideoSegmentsEndpoint()
    async prefetchSegments(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @Query() query: FeedPrefetchQueryDto,
    ): Promise<ApiResponseDto<SegmentPrefetchResponseDto>> {
        const requestedCount = query.count;

        await this.prefetchAllQualitySegmentsUseCase.execute(videoId, query.segment, requestedCount);
        return ApiResponseDto.success(
            {
                success: true,
                message: `${requestedCount}개 세그먼트 프리페치 완료`,
            } as SegmentPrefetchResponseDto & FeedVideoSegmentPrefetchResult,
            FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.segmentsPrefetched,
        );
    }
}
