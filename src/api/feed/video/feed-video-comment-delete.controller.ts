import { Delete, Param } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { DeleteCommentUseCase } from '../comment/application/use-cases/delete-comment.use-case';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { VideoActionSuccessResponseDto } from './dto/response/video-response.dto';
import { ApiDeleteFeedVideoCommentEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoCommentDeleteController {
    constructor(private readonly deleteCommentUseCase: DeleteCommentUseCase) {}

    @Delete('comment/:commentId')
    @ApiDeleteFeedVideoCommentEndpoint()
    async deleteComment(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<VideoActionSuccessResponseDto> {
        return this.deleteCommentUseCase.execute(commentId, userId);
    }
}
