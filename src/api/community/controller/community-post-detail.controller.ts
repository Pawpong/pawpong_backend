import { Get, Param, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';

import { GetCommunityPostCommentsUseCase } from '../application/use-cases/get-community-post-comments.use-case';
import { GetCommunityPostDetailUseCase } from '../application/use-cases/get-community-post-detail.use-case';
import { CommunityPublicController } from '../decorator/community-public-controller.decorator';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityPostCommentQueryDto } from '../dto/request/community-post-comment-query.dto';
import { CommunityPostCommentResponseDto } from '../dto/response/community-post-comment.dto';
import { CommunityPostDetailResponseDto } from '../dto/response/community-post-detail.dto';
import {
    ApiGetCommunityPostCommentsEndpoint,
    ApiGetCommunityPostDetailEndpoint,
} from '../swagger';

@CommunityPublicController()
export class CommunityPostDetailController {
    constructor(
        private readonly getDetailUseCase: GetCommunityPostDetailUseCase,
        private readonly getCommentsUseCase: GetCommunityPostCommentsUseCase,
    ) {}

    @Get('posts/:postId')
    @ApiGetCommunityPostDetailEndpoint()
    async detail(
        @Param('postId') postId: string,
    ): Promise<ApiResponseDto<CommunityPostDetailResponseDto>> {
        const result = await this.getDetailUseCase.execute(postId);
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.detailRetrieved);
    }

    @Get('posts/:postId/comments')
    @ApiGetCommunityPostCommentsEndpoint()
    async comments(
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
}
