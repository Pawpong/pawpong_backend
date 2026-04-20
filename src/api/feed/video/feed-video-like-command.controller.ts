import { Inject, Param, Post } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import type { ToggleFeedVideoLikeUseCasePort } from '../like/application/ports/feed-like-interaction.port';
import {
    TOGGLE_FEED_VIDEO_LIKE_USE_CASE,
} from '../like/application/tokens/feed-like-interaction.token';
import type { FeedLikeToggleResult } from '../like/application/types/feed-like-result.type';
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
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @CurrentUser('userId') userId: string,
        @CurrentActorType() actorType: ActorType,
    ): Promise<LikeToggleResponseDto> {
        return (await this.toggleLikeUseCase.execute(videoId, userId, actorType)) as
            LikeToggleResponseDto & FeedLikeToggleResult;
    }
}
