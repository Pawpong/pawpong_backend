import { Get, Inject, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import {
    GET_MY_LIKED_FEED_VIDEOS_USE_CASE,
    type GetMyLikedFeedVideosUseCasePort,
} from '../like/application/ports/feed-like-interaction.port';
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
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<MyLikedVideosResponseDto> {
        return this.getMyLikedVideosUseCase.execute(userId, Number(page), Number(limit));
    }
}
