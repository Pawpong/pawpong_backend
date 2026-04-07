import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { GetMyLikedVideosUseCase } from '../like/application/use-cases/get-my-liked-videos.use-case';
import { MyLikedVideosResponseDto } from '../like/dto/response/like-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiGetMyLikedFeedVideosEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoLikedVideosController {
    constructor(private readonly getMyLikedVideosUseCase: GetMyLikedVideosUseCase) {}

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
