import { Body, Param, Post } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { CreateCommentUseCase } from '../comment/application/use-cases/create-comment.use-case';
import { CreateCommentRequestDto } from '../comment/dto/request/comment-request.dto';
import { CommentCreateResponseDto } from '../comment/dto/response/comment-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiCreateFeedVideoCommentEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoCommentCreateController {
    constructor(private readonly createCommentUseCase: CreateCommentUseCase) {}

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
