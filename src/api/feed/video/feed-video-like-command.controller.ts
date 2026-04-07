import { Param, Post } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ToggleLikeUseCase } from '../like/application/use-cases/toggle-like.use-case';
import { LikeToggleResponseDto } from '../like/dto/response/like-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiToggleFeedVideoLikeEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoLikeCommandController {
    constructor(private readonly toggleLikeUseCase: ToggleLikeUseCase) {}

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
