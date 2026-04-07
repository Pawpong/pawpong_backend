import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { CreateCommentUseCase } from '../comment/application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from '../comment/application/use-cases/delete-comment.use-case';
import { UpdateCommentUseCase } from '../comment/application/use-cases/update-comment.use-case';
import { CreateCommentRequestDto, UpdateCommentRequestDto } from '../comment/dto/request/comment-request.dto';
import {
    CommentCreateResponseDto,
    CommentUpdateResponseDto,
} from '../comment/dto/response/comment-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { VideoActionSuccessResponseDto } from './dto/response/video-response.dto';
import {
    ApiCreateFeedVideoCommentEndpoint,
    ApiDeleteFeedVideoCommentEndpoint,
    ApiUpdateFeedVideoCommentEndpoint,
} from './swagger';

@FeedProtectedController()
export class FeedVideoCommentCommandController {
    constructor(
        private readonly createCommentUseCase: CreateCommentUseCase,
        private readonly updateCommentUseCase: UpdateCommentUseCase,
        private readonly deleteCommentUseCase: DeleteCommentUseCase,
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

    @Patch('comment/:commentId')
    @ApiUpdateFeedVideoCommentEndpoint()
    async updateComment(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateCommentRequestDto,
    ): Promise<CommentUpdateResponseDto> {
        return this.updateCommentUseCase.execute(commentId, userId, dto.content);
    }

    @Delete('comment/:commentId')
    @ApiDeleteFeedVideoCommentEndpoint()
    async deleteComment(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<VideoActionSuccessResponseDto> {
        return this.deleteCommentUseCase.execute(commentId, userId);
    }
}
