import { Get, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { GetCommentsUseCase } from '../comment/application/use-cases/get-comments.use-case';
import { GetRepliesUseCase } from '../comment/application/use-cases/get-replies.use-case';
import { CommentListResponseDto, ReplyListResponseDto } from '../comment/dto/response/comment-response.dto';
import { FeedOptionalAuthController } from './decorator/feed-video-controller.decorator';
import { ApiGetFeedVideoCommentsEndpoint, ApiGetFeedVideoRepliesEndpoint } from './swagger';

@FeedOptionalAuthController()
export class FeedVideoCommentQueryController {
    constructor(
        private readonly getCommentsUseCase: GetCommentsUseCase,
        private readonly getRepliesUseCase: GetRepliesUseCase,
    ) {}

    @Get('comment/:videoId')
    @ApiGetFeedVideoCommentsEndpoint()
    async getComments(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<CommentListResponseDto> {
        return this.getCommentsUseCase.execute(videoId, userId, Number(page), Number(limit));
    }

    @Get('comment/:commentId/replies')
    @ApiGetFeedVideoRepliesEndpoint()
    async getReplies(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<ReplyListResponseDto> {
        return this.getRepliesUseCase.execute(commentId, userId, Number(page), Number(limit));
    }
}
