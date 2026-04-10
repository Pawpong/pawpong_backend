import { Get, Inject, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import {
    GET_FEED_VIDEO_COMMENTS_USE_CASE,
    GET_FEED_VIDEO_REPLIES_USE_CASE,
    type GetFeedVideoCommentsUseCasePort,
    type GetFeedVideoRepliesUseCasePort,
} from '../comment/application/ports/feed-comment-interaction.port';
import type { FeedCommentListResult, FeedReplyListResult } from '../comment/application/types/feed-comment-result.type';
import { CommentListResponseDto, ReplyListResponseDto } from '../comment/dto/response/comment-response.dto';
import { FeedOptionalAuthController } from './decorator/feed-video-controller.decorator';
import { ApiGetFeedVideoCommentsEndpoint, ApiGetFeedVideoRepliesEndpoint } from './swagger';

@FeedOptionalAuthController()
export class FeedVideoCommentQueryController {
    constructor(
        @Inject(GET_FEED_VIDEO_COMMENTS_USE_CASE)
        private readonly getCommentsUseCase: GetFeedVideoCommentsUseCasePort,
        @Inject(GET_FEED_VIDEO_REPLIES_USE_CASE)
        private readonly getRepliesUseCase: GetFeedVideoRepliesUseCasePort,
    ) {}

    @Get('comment/:videoId')
    @ApiGetFeedVideoCommentsEndpoint()
    async getComments(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<CommentListResponseDto> {
        return (await this.getCommentsUseCase.execute(videoId, userId, Number(page), Number(limit))) as
            CommentListResponseDto & FeedCommentListResult;
    }

    @Get('comment/:commentId/replies')
    @ApiGetFeedVideoRepliesEndpoint()
    async getReplies(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<ReplyListResponseDto> {
        return (await this.getRepliesUseCase.execute(commentId, userId, Number(page), Number(limit))) as
            ReplyListResponseDto & FeedReplyListResult;
    }
}
