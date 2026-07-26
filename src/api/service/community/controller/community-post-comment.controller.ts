import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { Public } from '../../../../common/decorator/public.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { CreateCommunityPostCommentUseCase } from '../application/use-cases/create-community-post-comment.use-case';
import { DeleteCommunityPostCommentUseCase } from '../application/use-cases/delete-community-post-comment.use-case';
import { GetCommunityPostCommentsUseCase } from '../application/use-cases/get-community-post-comments.use-case';
import { UpdateCommunityPostCommentUseCase } from '../application/use-cases/update-community-post-comment.use-case';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityProtectedController } from '../decorator/community-protected-controller.decorator';
import { CommunityPostCommentCreateRequestDto } from '../dto/request/community-post-comment-create-request.dto';
import { CommunityPostCommentQueryDto } from '../dto/request/community-post-comment-query.dto';
import { CommunityPostCommentUpdateRequestDto } from '../dto/request/community-post-comment-update-request.dto';
import type { CommunityPostCommentResponseDto } from '../dto/response/community-post-comment.dto';
import {
    ApiCreateCommentEndpoint,
    ApiDeleteCommentEndpoint,
    ApiGetCommunityPostCommentsEndpoint,
    ApiUpdateCommentEndpoint,
} from '../swagger/index';

/**
 * v2 커뮤니티 댓글/답글 — 조회(공개) + 작성·수정·삭제(인증) (Figma 315:5433).
 */
@CommunityProtectedController()
export class CommunityPostCommentController {
    constructor(
        private readonly getCommentsUseCase: GetCommunityPostCommentsUseCase,
        private readonly createUseCase: CreateCommunityPostCommentUseCase,
        private readonly updateUseCase: UpdateCommunityPostCommentUseCase,
        private readonly deleteUseCase: DeleteCommunityPostCommentUseCase,
    ) {}

    @Public()
    @Get('posts/:postId/comments')
    @ApiGetCommunityPostCommentsEndpoint()
    async list(
        @Param('postId') postId: string,
        @Query() query: CommunityPostCommentQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<CommunityPostCommentResponseDto>>> {
        const result = await this.getCommentsUseCase.execute({
            postId,
            page: query.page,
            pageSize: query.pageSize,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            COMMUNITY_RESPONSE_MESSAGES.commentsRetrieved,
        );
    }

    @Post('posts/:postId/comments')
    @ApiCreateCommentEndpoint()
    async create(
        @Param('postId') postId: string,
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: 'adopter' | 'breeder',
        @Body() body: CommunityPostCommentCreateRequestDto,
    ): Promise<ApiResponseDto<{ commentId: string }>> {
        const result = await this.createUseCase.execute(postId, userId, role, {
            body: body.body,
            parentCommentId: body.parentCommentId,
        });
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.commentCreated);
    }

    @Patch('comments/:commentId')
    @ApiUpdateCommentEndpoint()
    async update(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId: string,
        @Body() body: CommunityPostCommentUpdateRequestDto,
    ): Promise<ApiResponseDto<{ commentId: string; updated: boolean }>> {
        const result = await this.updateUseCase.execute(commentId, userId, body.body);
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.commentUpdated);
    }

    @Delete('comments/:commentId')
    @ApiDeleteCommentEndpoint()
    async delete(
        @Param('commentId') commentId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<{ deleted: boolean }>> {
        const result = await this.deleteUseCase.execute(commentId, userId);
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.commentDeleted);
    }
}
