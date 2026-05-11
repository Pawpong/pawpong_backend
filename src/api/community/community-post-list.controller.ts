import { Get, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';

import { GetCommunityPostListUseCase } from './application/use-cases/get-community-post-list.use-case';
import { CommunityPublicController } from './decorator/community-public-controller.decorator';
import { COMMUNITY_RESPONSE_MESSAGES } from './constants/community-response-messages';
import { CommunityPostListQueryDto } from './dto/request/community-post-list-query.dto';
import { CommunityPostCardResponseDto } from './dto/response/community-post-card.dto';
import { ApiGetCommunityPostListEndpoint } from './swagger';

@CommunityPublicController()
export class CommunityPostListController {
    constructor(private readonly useCase: GetCommunityPostListUseCase) {}

    @Get('posts')
    @ApiGetCommunityPostListEndpoint()
    async list(
        @Query() query: CommunityPostListQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<CommunityPostCardResponseDto>>> {
        const result = await this.useCase.execute({
            petType: query.petType,
            category: query.category,
            sort: query.sort,
            page: query.page,
            pageSize: query.pageSize,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            COMMUNITY_RESPONSE_MESSAGES.listRetrieved,
        );
    }
}
