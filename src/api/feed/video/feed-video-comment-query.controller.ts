import { Get, Inject, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import type {
    GetFeedVideoCommentsUseCasePort,
    GetFeedVideoRepliesUseCasePort,
} from '../comment/application/ports/feed-comment-interaction.port';
import {
    GET_FEED_VIDEO_COMMENTS_USE_CASE,
    GET_FEED_VIDEO_REPLIES_USE_CASE,
} from '../comment/application/tokens/feed-comment-interaction.token';
import type { FeedCommentListResult, FeedReplyListResult } from '../comment/application/types/feed-comment-result.type';
import { FeedPaginationQueryDto } from './dto/request/feed-pagination-query.dto';
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
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @Query() query: FeedPaginationQueryDto,
        @CurrentUser('userId') userId?: string,
    ): Promise<CommentListResponseDto> {
        return (await this.getCommentsUseCase.execute(videoId, userId, query.page, query.limit)) as
            CommentListResponseDto & FeedCommentListResult;
    }

    @Get('comment/:commentId/replies')
    @ApiGetFeedVideoRepliesEndpoint()
    async getReplies(
        @Param('commentId', new MongoObjectIdPipe('댓글')) commentId: string,
        @Query() query: FeedPaginationQueryDto,
        @CurrentUser('userId') userId?: string,
    ): Promise<ReplyListResponseDto> {
        return (await this.getRepliesUseCase.execute(commentId, userId, query.page, query.limit)) as
            ReplyListResponseDto & FeedReplyListResult;
    }
}
