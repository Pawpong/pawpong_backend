import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { GetCommunityPostListUseCase } from '../application/use-cases/get-community-post-list.use-case';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityProtectedController } from '../decorator/community-protected-controller.decorator';
import { CommunityPostPaginationQueryDto } from '../dto/request/community-post-list-query.dto';
import type { CommunityPostCardResponseDto } from '../dto/response/community-post-card.dto';
import { ApiGetMyDraftCommunityPostsEndpoint } from '../swagger/index';

/**
 * v2 커뮤니티 임시저장 — 내 임시저장(draft) 게시글 목록.
 *
 * 상세 조회(posts/:postId) 와 경로가 겹치지 않도록 두 세그먼트(posts/me/drafts) 로 노출한다.
 * status=draft 조회는 use-case 에서 뷰어 본인 글로 강제 제한된다.
 */
@CommunityProtectedController()
export class CommunityPostDraftController {
    constructor(private readonly listUseCase: GetCommunityPostListUseCase) {}

    @Get('posts/me/drafts')
    @ApiGetMyDraftCommunityPostsEndpoint()
    async getMyDrafts(
        @CurrentUser('userId') userId: string,
        @Query() query: CommunityPostPaginationQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<CommunityPostCardResponseDto>>> {
        const result = await this.listUseCase.execute({
            userId,
            status: 'draft',
            page: query.page,
            pageSize: query.pageSize,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            COMMUNITY_RESPONSE_MESSAGES.draftListRetrieved,
        );
    }
}
