import { Body, Inject, Param, Post } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import {
    CREATE_FEED_VIDEO_COMMENT_USE_CASE,
    type CreateFeedVideoCommentUseCasePort,
} from '../comment/application/ports/feed-comment-interaction.port';
import { CreateCommentRequestDto } from '../comment/dto/request/comment-request.dto';
import { CommentCreateResponseDto } from '../comment/dto/response/comment-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiCreateFeedVideoCommentEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoCommentCreateController {
    constructor(
        @Inject(CREATE_FEED_VIDEO_COMMENT_USE_CASE)
        private readonly createCommentUseCase: CreateFeedVideoCommentUseCasePort,
    ) {}

    @Post('comment/:videoId')
    @ApiCreateFeedVideoCommentEndpoint()
    async createComment(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
        @CurrentActorType() actorType: ActorType,
        @Body() dto: CreateCommentRequestDto,
    ): Promise<CommentCreateResponseDto> {
        return this.createCommentUseCase.execute(videoId, userId, actorType, dto.content, dto.parentId);
    }
}
