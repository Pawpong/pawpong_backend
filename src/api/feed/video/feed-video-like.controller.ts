import { Get, Param, Post, Query } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { GetLikeStatusUseCase } from '../like/application/use-cases/get-like-status.use-case';
import { GetMyLikedVideosUseCase } from '../like/application/use-cases/get-my-liked-videos.use-case';
import { ToggleLikeUseCase } from '../like/application/use-cases/toggle-like.use-case';
import { LikeStatusResponseDto, LikeToggleResponseDto, MyLikedVideosResponseDto } from '../like/dto/response/like-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import {
    ApiGetFeedVideoLikeStatusEndpoint,
    ApiGetMyLikedFeedVideosEndpoint,
    ApiToggleFeedVideoLikeEndpoint,
} from './swagger';

@FeedProtectedController()
export class FeedVideoLikeController {
    constructor(
        private readonly toggleLikeUseCase: ToggleLikeUseCase,
        private readonly getLikeStatusUseCase: GetLikeStatusUseCase,
        private readonly getMyLikedVideosUseCase: GetMyLikedVideosUseCase,
    ) {}

    @Post('like/:videoId')
    @ApiToggleFeedVideoLikeEndpoint()
    async toggleLike(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
        @CurrentActorType() actorType: ActorType,
    ): Promise<LikeToggleResponseDto> {
        return this.toggleLikeUseCase.execute(videoId, userId, actorType);
    }

    @Get('like/:videoId/status')
    @ApiGetFeedVideoLikeStatusEndpoint()
    async getLikeStatus(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<LikeStatusResponseDto> {
        return this.getLikeStatusUseCase.execute(videoId, userId);
    }

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
