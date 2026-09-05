import { Get, Query } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { GetCommunityPostReportsUseCase } from '../application/use-cases/get-community-post-reports.use-case';
import { COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES } from '../constants/community-report-admin-response-messages';
import { CommunityAdminController } from '../decorator/community-admin-controller.decorator';
import { CommunityReportAdminListQueryDto } from '../dto/request/community-report-admin-list-query.dto';
import { CommunityReportAdminItemResponseDto } from '../dto/response/community-report-admin-response.dto';
import { ApiGetCommunityPostReportsEndpoint } from '../swagger/index';

/** 커뮤니티 신고 목록 조회 (관리자) */
@CommunityAdminController()
export class CommunityReportAdminQueryController {
    constructor(private readonly getReportsUseCase: GetCommunityPostReportsUseCase) {}

    @Get('reports')
    @ApiGetCommunityPostReportsEndpoint()
    async list(
        @Query() query: CommunityReportAdminListQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<CommunityReportAdminItemResponseDto>>> {
        const result = await this.getReportsUseCase.execute({
            page: query.page,
            pageSize: query.limit,
            status: query.status,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES.reportsRetrieved,
        );
    }
}
