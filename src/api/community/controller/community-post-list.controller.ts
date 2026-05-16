import { Get, Query, UnauthorizedException } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';

import { GetCommunityPostListUseCase } from '../application/use-cases/get-community-post-list.use-case';
import { CommunityPublicController } from '../decorator/community-public-controller.decorator';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityPostListQueryDto } from '../dto/request/community-post-list-query.dto';
import { CommunityPostCardResponseDto } from '../dto/response/community-post-card.dto';
import { ApiGetCommunityPostListEndpoint } from '../swagger';

@CommunityPublicController()
export class CommunityPostListController {
    constructor(private readonly useCase: GetCommunityPostListUseCase) {}

    @Get('posts')
    @ApiGetCommunityPostListEndpoint()
    async list(
        @Query() query: CommunityPostListQueryDto,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<PaginationResponseDto<CommunityPostCardResponseDto>>> {
        const resolvedAuthorId = this.resolveAuthorId(query.authorId, userId);

        const result = await this.useCase.execute({
            petType: query.petType,
            category: query.category,
            authorId: resolvedAuthorId,
            sort: query.sort,
            page: query.page,
            pageSize: query.pageSize,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            COMMUNITY_RESPONSE_MESSAGES.listRetrieved,
        );
    }

    /**
     * authorId='me' 별칭은 인증된 본인 id 로 치환한다.
     * 비로그인 사용자가 'me' 를 지정하면 401 — 공개 list 자체는 OptionalAuth 라 토큰이 없어도
     * 다른 사용자 게시글은 볼 수 있지만, 본인 글 필터는 인증 전제이므로 명시적으로 차단.
     */
    private resolveAuthorId(authorId: string | undefined, userId?: string): string | undefined {
        if (!authorId) {
            return undefined;
        }
        if (authorId === 'me') {
            if (!userId) {
                throw new UnauthorizedException('authorId="me" 사용은 인증 토큰이 필요합니다.');
            }
            return userId;
        }
        return authorId;
    }
}
