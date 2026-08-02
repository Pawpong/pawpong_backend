import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES } from '../constants/feed-video-response-messages';
import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../../../common/decorator/current-user.decorator';
import { GetMyVideosUseCase } from '../application/use-cases/get-my-videos.use-case';
import type { FeedMyVideoListResult } from '../application/types/feed-video-result.type';
import { FeedProtectedController } from '../decorator/feed-video-controller.decorator';
import { FeedPaginationQueryDto } from '../dto/request/feed-pagination-query.dto';
import { MyVideoListResponseDto } from '../dto/response/video-response.dto';
import { ApiGetMyFeedVideosEndpoint } from '../swagger/index';

@FeedProtectedController()
export class FeedVideoLibraryController {
    constructor(private readonly getMyVideosUseCase: GetMyVideosUseCase) {}

    @Get('videos/my/list')
    @ApiGetMyFeedVideosEndpoint()
    async getMyVideos(
        @CurrentUser('userId') userId: string,
        @Query() query: FeedPaginationQueryDto,
    ): Promise<ApiResponseDto<MyVideoListResponseDto>> {
        return ApiResponseDto.success(
            (await this.getMyVideosUseCase.execute(userId, query.page, query.limit)) as MyVideoListResponseDto &
            FeedMyVideoListResult,
            FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.myVideosListed,
        );
    }
}
