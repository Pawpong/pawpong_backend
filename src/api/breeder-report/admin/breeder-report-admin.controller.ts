import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

import { BreederReportAdminService } from './breeder-report-admin.service';
import { ReportListRequestDto } from './dto/request/report-list-request.dto';
import { ReportActionRequestDto } from './dto/request/report-action-request.dto';
import { ReportListResponseDto } from './dto/response/report-list-response.dto';
import { ReportActionResponseDto } from './dto/response/report-action-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';

/**
 * 브리더 신고 관리 Admin 컨트롤러
 *
 * 관리자가 브리더 신고를 관리하는 API를 제공합니다.
 * 모든 엔드포인트는 admin 권한이 필요합니다.
 *
 * 주요 기능:
 * - 브리더 신고 목록 조회
 * - 브리더 신고 처리 (승인/반려)
 */
@ApiController('브리더 신고 관리 (Admin)')
@Controller('breeder-report-admin')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreederReportAdminController {
    constructor(private readonly breederReportAdminService: BreederReportAdminService) {}

    @Get('reports')
    @ApiEndpoint({
        summary: '브리더 신고 목록 조회',
        description: '브리더에 대한 신고 목록을 조회합니다. 상태별 필터링 및 페이지네이션을 지원합니다.',
        responseType: ReportListResponseDto,
        isPublic: false,
    })
    async getReports(
        @CurrentUser() user: any,
        @Query() filter: ReportListRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<ReportListResponseDto>>> {
        const result = await this.breederReportAdminService.getReports(user.userId, filter);
        return ApiResponseDto.success(result, '브리더 신고 목록이 조회되었습니다.');
    }

    @Patch('reports/:reportId')
    @ApiEndpoint({
        summary: '브리더 신고 처리',
        description: '브리더 신고를 승인(제재) 또는 반려 처리합니다.',
        responseType: ReportActionResponseDto,
        isPublic: false,
    })
    async handleReport(
        @CurrentUser() user: any,
        @Param('reportId') reportId: string,
        @Body() actionData: ReportActionRequestDto,
    ): Promise<ApiResponseDto<ReportActionResponseDto>> {
        const result = await this.breederReportAdminService.handleReport(user.userId, reportId, actionData);
        const message =
            actionData.action === 'resolve' ? '신고가 승인되었습니다. 브리더가 제재됩니다.' : '신고가 반려되었습니다.';
        return ApiResponseDto.success(result, message);
    }
}
