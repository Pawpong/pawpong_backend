import { Delete, Inject, Param } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import {
    DELETE_FEED_VIDEO_COMMENT_USE_CASE,
    type DeleteFeedVideoCommentUseCasePort,
} from '../comment/application/ports/feed-comment-interaction.port';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { VideoActionSuccessResponseDto } from './dto/response/video-response.dto';
import { ApiDeleteFeedVideoCommentEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoCommentDeleteController {
    constructor(
        @Inject(DELETE_FEED_VIDEO_COMMENT_USE_CASE)
        private readonly deleteCommentUseCase: DeleteFeedVideoCommentUseCasePort,
    ) {}

    @Delete('comment/:commentId')
    @ApiDeleteFeedVideoCommentEndpoint()
    async deleteComment(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<VideoActionSuccessResponseDto> {
        return this.deleteCommentUseCase.execute(commentId, userId);
    }
}
