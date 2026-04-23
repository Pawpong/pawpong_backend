import { Get, Inject, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import type { GetMyLikedFeedVideosUseCasePort } from '../like/application/ports/feed-like-interaction.port';
import { GET_MY_LIKED_FEED_VIDEOS_USE_CASE } from '../like/application/tokens/feed-like-interaction.token';
import type { FeedMyLikedVideosResult } from '../like/application/types/feed-like-result.type';
import { FeedPaginationQueryDto } from './dto/request/feed-pagination-query.dto';
import { MyLikedVideosResponseDto } from '../like/dto/response/like-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiGetMyLikedFeedVideosEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoLikedVideosController {
    constructor(
        @Inject(GET_MY_LIKED_FEED_VIDEOS_USE_CASE)
        private readonly getMyLikedVideosUseCase: GetMyLikedFeedVideosUseCasePort,
    ) {}

    @Get('like/my/list')
    @ApiGetMyLikedFeedVideosEndpoint()
    async getMyLikedVideos(
        @CurrentUser('userId') userId: string,
        @Query() query: FeedPaginationQueryDto,
    ): Promise<MyLikedVideosResponseDto> {
        return (await this.getMyLikedVideosUseCase.execute(
            userId,
            query.page,
            query.limit,
        )) as MyLikedVideosResponseDto & FeedMyLikedVideosResult;
    }
}
