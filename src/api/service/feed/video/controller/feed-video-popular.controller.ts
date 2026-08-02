import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES } from '../constants/feed-video-response-messages';
import { Get, Query } from '@nestjs/common';

import { GetPopularVideosUseCase } from '../application/use-cases/get-popular-videos.use-case';
import type { FeedPopularVideoItemResult } from '../application/types/feed-video-result.type';
import { FeedPublicController } from '../decorator/feed-video-controller.decorator';
import { FeedPopularLimitQueryDto } from '../dto/request/feed-limit-query.dto';
import { PopularVideoItemDto } from '../dto/response/video-response.dto';
import { ApiGetPopularFeedVideosEndpoint } from '../swagger/index';

@FeedPublicController()
export class FeedVideoPopularController {
    constructor(private readonly getPopularVideosUseCase: GetPopularVideosUseCase) {}

    @Get('videos/popular')
    @ApiGetPopularFeedVideosEndpoint()
    async getPopularVideos(@Query() query: FeedPopularLimitQueryDto): Promise<ApiResponseDto<PopularVideoItemDto[]>> {
        return ApiResponseDto.success(
            (await this.getPopularVideosUseCase.execute(query.limit)) as Array<
            PopularVideoItemDto & FeedPopularVideoItemResult
        >,
            FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.popularVideosListed,
        );
    }
}
