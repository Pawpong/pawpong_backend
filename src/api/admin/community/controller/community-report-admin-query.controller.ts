import { Get, Query } from '@nestjs/common';

import { ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { GetCommunityPostReportsUseCase } from '../application/use-cases/get-community-post-reports.use-case';
import { CommunityAdminController } from '../decorator/community-admin-controller.decorator';
import { CommunityReportAdminListQueryDto } from '../dto/request/community-report-admin-list-query.dto';
import { CommunityReportAdminItemResponseDto } from '../dto/response/community-report-admin-response.dto';

/**
 * 커뮤니티 신고 목록 조회 — 관리자 전용.
 */
@CommunityAdminController()
export class CommunityReportAdminQueryController {
    constructor(private readonly getReportsUseCase: GetCommunityPostReportsUseCase) {}

    @Get('reports')
    @ApiPaginatedEndpoint({
        summary: '커뮤니티 신고 목록 조회',
        description: 'status 필터(pending/resolved/dismissed) 지원. 최신 신고 순 정렬.',
        responseType: PaginationResponseDto,
        itemType: CommunityReportAdminItemResponseDto,
        isPublic: false,
        successDescription: '신고 목록 조회 성공',
        successMessageExample: '커뮤니티 신고 목록 조회 성공',
    })
    async list(
        @Query() query: CommunityReportAdminListQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<CommunityReportAdminItemResponseDto>>> {
        const result = await this.getReportsUseCase.execute({
            page: query.page,
            pageSize: query.limit,
            status: query.status,
        });
        return ApiResponseDto.success(PaginationResponseDto.fromPageResult(result), '커뮤니티 신고 목록 조회 성공');
    }
}
