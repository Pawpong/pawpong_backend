import { Body, Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { UpdateCommentUseCase } from '../comment/application/use-cases/update-comment.use-case';
import { UpdateCommentRequestDto } from '../comment/dto/request/comment-request.dto';
import { CommentUpdateResponseDto } from '../comment/dto/response/comment-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiUpdateFeedVideoCommentEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoCommentUpdateController {
    constructor(private readonly updateCommentUseCase: UpdateCommentUseCase) {}

    @Patch('comment/:commentId')
    @ApiUpdateFeedVideoCommentEndpoint()
    async updateComment(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateCommentRequestDto,
    ): Promise<CommentUpdateResponseDto> {
        return this.updateCommentUseCase.execute(commentId, userId, dto.content);
    }
}
