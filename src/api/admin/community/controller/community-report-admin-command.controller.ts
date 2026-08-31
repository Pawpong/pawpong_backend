import { HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { HandleCommunityPostReportUseCase } from '../application/use-cases/handle-community-post-report.use-case';
import { COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES } from '../constants/community-report-admin-response-messages';
import { CommunityAdminController } from '../decorator/community-admin-controller.decorator';
import { CommunityReportAdminActionResponseDto } from '../dto/response/community-report-admin-response.dto';
import { ApiDismissCommunityPostReportEndpoint, ApiResolveCommunityPostReportEndpoint } from '../swagger/index';

/** 커뮤니티 신고 처리 (관리자) */
@CommunityAdminController()
export class CommunityReportAdminCommandController {
    constructor(private readonly handleReportUseCase: HandleCommunityPostReportUseCase) {}

    @Post('reports/:reportId/resolve')
    @HttpCode(HttpStatus.OK)
    @ApiResolveCommunityPostReportEndpoint()
    async resolve(
        @Param('reportId') reportId: string,
        @CurrentUser('userId') adminId: string,
    ): Promise<ApiResponseDto<CommunityReportAdminActionResponseDto>> {
        const result = await this.handleReportUseCase.execute(reportId, adminId, 'resolve');
        return ApiResponseDto.success(result, COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES.reportResolved);
    }

    @Post('reports/:reportId/dismiss')
    @HttpCode(HttpStatus.OK)
    @ApiDismissCommunityPostReportEndpoint()
    async dismiss(
        @Param('reportId') reportId: string,
        @CurrentUser('userId') adminId: string,
    ): Promise<ApiResponseDto<CommunityReportAdminActionResponseDto>> {
        const result = await this.handleReportUseCase.execute(reportId, adminId, 'dismiss');
        return ApiResponseDto.success(result, COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES.reportDismissed);
    }
}
