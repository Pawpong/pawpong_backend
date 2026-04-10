import { Body, Inject, Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import {
    UPDATE_FEED_VIDEO_COMMENT_USE_CASE,
    type UpdateFeedVideoCommentUseCasePort,
} from '../comment/application/ports/feed-comment-interaction.port';
import type { FeedCommentUpdateResult } from '../comment/application/types/feed-comment-result.type';
import { UpdateCommentRequestDto } from '../comment/dto/request/comment-request.dto';
import { CommentUpdateResponseDto } from '../comment/dto/response/comment-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiUpdateFeedVideoCommentEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoCommentUpdateController {
    constructor(
        @Inject(UPDATE_FEED_VIDEO_COMMENT_USE_CASE)
        private readonly updateCommentUseCase: UpdateFeedVideoCommentUseCasePort,
    ) {}

    @Patch('comment/:commentId')
    @ApiUpdateFeedVideoCommentEndpoint()
    async updateComment(
        @Param('commentId', new MongoObjectIdPipe('댓글')) commentId: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateCommentRequestDto,
    ): Promise<CommentUpdateResponseDto> {
        return (await this.updateCommentUseCase.execute(commentId, userId, dto.content)) as
            CommentUpdateResponseDto & FeedCommentUpdateResult;
    }
}
