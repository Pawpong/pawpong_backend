import { Delete, Get, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { GetMySavedCommunityPostsUseCase } from '../application/use-cases/get-my-saved-community-posts.use-case';
import { SaveCommunityPostUseCase } from '../application/use-cases/save-community-post.use-case';
import { UnsaveCommunityPostUseCase } from '../application/use-cases/unsave-community-post.use-case';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityProtectedController } from '../decorator/community-protected-controller.decorator';
import { CommunityPostPaginationQueryDto } from '../dto/request/community-post-list-query.dto';
import type { CommunityBookmarkResponseDto, CommunityUnsaveResponseDto } from '../dto/response/community-bookmark-response.dto';
import type { CommunityPostCardResponseDto } from '../dto/response/community-post-card.dto';
import {
    ApiGetMySavedCommunityPostsEndpoint,
    ApiSaveCommunityPostEndpoint,
    ApiUnsaveCommunityPostEndpoint,
} from '../swagger';

/**
 * v2 커뮤니티 게시글 저장(북마크) — 저장 피드 탭 (Figma 711:59266).
 */
@CommunityProtectedController()
export class CommunityPostBookmarkController {
    constructor(
        private readonly saveUseCase: SaveCommunityPostUseCase,
        private readonly unsaveUseCase: UnsaveCommunityPostUseCase,
        private readonly getMySavedUseCase: GetMySavedCommunityPostsUseCase,
    ) {}

    @Post('posts/:postId/bookmark')
    @ApiSaveCommunityPostEndpoint()
    async save(
        @Param('postId') postId: string,
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: 'adopter' | 'breeder',
    ): Promise<ApiResponseDto<CommunityBookmarkResponseDto>> {
        const userModel = role === 'breeder' ? 'Breeder' : 'Adopter';
        const { alreadySaved } = await this.saveUseCase.execute({ postId, userId, userModel });
        return ApiResponseDto.success(
            { postId, saved: !alreadySaved },
            COMMUNITY_RESPONSE_MESSAGES.saved,
        );
    }

    @Delete('posts/:postId/bookmark')
    @ApiUnsaveCommunityPostEndpoint()
    async unsave(
        @Param('postId') postId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<CommunityUnsaveResponseDto>> {
        const { wasSaved } = await this.unsaveUseCase.execute({ postId, userId });
        return ApiResponseDto.success(
            { postId, unsaved: wasSaved },
            COMMUNITY_RESPONSE_MESSAGES.unsaved,
        );
    }

    @Get('posts/me/bookmarks')
    @ApiGetMySavedCommunityPostsEndpoint()
    async getMySaved(
        @CurrentUser('userId') userId: string,
        @Query() query: CommunityPostPaginationQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<CommunityPostCardResponseDto>>> {
        const result = await this.getMySavedUseCase.execute({
            userId,
            page: query.page,
            pageSize: query.pageSize,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            COMMUNITY_RESPONSE_MESSAGES.savedListRetrieved,
        );
    }
}
