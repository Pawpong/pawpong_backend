import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES } from '../constants/feed-video-response-messages';
import { Get, Query } from '@nestjs/common';

import { GetFeedUseCase } from '../application/use-cases/get-feed.use-case';
import type { FeedVideoFeedResult } from '../application/types/feed-video-result.type';
import { FeedPublicController } from '../decorator/feed-video-controller.decorator';
import { FeedPaginationQueryDto } from '../dto/request/feed-pagination-query.dto';
import { FeedResponseDto } from '../dto/response/video-response.dto';
import { ApiGetFeedVideosEndpoint } from '../swagger/index';

@FeedPublicController()
export class FeedVideoListController {
    constructor(private readonly getFeedUseCase: GetFeedUseCase) {}

    @Get('videos')
    @ApiGetFeedVideosEndpoint()
    async getFeed(@Query() query: FeedPaginationQueryDto): Promise<ApiResponseDto<FeedResponseDto>> {
        return ApiResponseDto.success(
            (await this.getFeedUseCase.execute(query.page, query.limit)) as FeedResponseDto & FeedVideoFeedResult,
            FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.feedListed,
        );
    }
}
