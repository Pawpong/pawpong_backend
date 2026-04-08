import { Inject, Param, Post } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import {
    TOGGLE_FEED_VIDEO_LIKE_USE_CASE,
    type ToggleFeedVideoLikeUseCasePort,
} from '../like/application/ports/feed-like-interaction.port';
import { LikeToggleResponseDto } from '../like/dto/response/like-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiToggleFeedVideoLikeEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoLikeCommandController {
    constructor(
        @Inject(TOGGLE_FEED_VIDEO_LIKE_USE_CASE)
        private readonly toggleLikeUseCase: ToggleFeedVideoLikeUseCasePort,
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
}
