import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

import { AdopterAdminService } from './adopter-admin.service';

import { ApplicationListRequestDto } from './dto/request/application-list-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ReviewReportItemDto } from './dto/response/review-report-list.dto';
import { ReviewDeleteResponseDto } from './dto/response/review-delete-response.dto';
import { AdminApplicationListResponseDto } from './dto/response/application-list-response.dto';
import { AdminApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';

/**
 * 입양자 관리 Admin 컨트롤러
 *
 * 입양자 도메인에 대한 관리자 전용 API를 제공합니다.
 * 모든 엔드포인트는 admin 권한이 필요합니다.
 *
 * 주요 기능:
 * - 후기 신고 관리
 * - 부적절한 후기 삭제
 * - 입양 신청 모니터링
 */
@ApiController('입양자 관리 (Admin)')
@Controller('adopter-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdopterAdminController {
    constructor(private readonly adopterAdminService: AdopterAdminService) {}

    @Get('reviews/reports')
    @ApiEndpoint({
        summary: '후기 신고 목록 조회',
        description: '신고된 후기 목록을 조회합니다. 입양자가 신고한 부적절한 후기들을 관리자가 검토할 수 있습니다.',
        responseType: PaginationResponseDto,
        isPublic: false,
    })
    async getReviewReports(
        @CurrentUser() user: any,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ): Promise<ApiResponseDto<PaginationResponseDto<ReviewReportItemDto>>> {
        const result = await this.adopterAdminService.getReviewReports(user.userId, page, limit);
        return ApiResponseDto.success(result, '후기 신고 목록이 조회되었습니다.');
    }

    @Delete('reviews/:breederId/:reviewId')
    @ApiEndpoint({
        summary: '부적절한 후기 삭제',
        description: '신고된 부적절한 후기를 삭제합니다.',
        responseType: ReviewDeleteResponseDto,
        isPublic: false,
    })
    async deleteReview(
        @CurrentUser() user: any,
        @Param('breederId') breederId: string,
        @Param('reviewId') reviewId: string,
    ): Promise<ApiResponseDto<ReviewDeleteResponseDto>> {
        const result = await this.adopterAdminService.deleteReview(user.userId, breederId, reviewId);
        return ApiResponseDto.success(result, '부적절한 후기가 삭제되었습니다.');
    }

    // ================== 입양 신청 모니터링 ==================

    @Get('applications')
    @ApiEndpoint({
        summary: '입양 신청 리스트 조회',
        description: '전체 입양 신청 내역을 조회합니다. 페이지네이션, 필터링, 통계 정보를 함께 제공합니다.',
        responseType: AdminApplicationListResponseDto,
        isPublic: false,
    })
    async getApplicationList(
        @CurrentUser() user: any,
        @Query() filters: ApplicationListRequestDto,
    ): Promise<ApiResponseDto<AdminApplicationListResponseDto>> {
        const result = await this.adopterAdminService.getApplicationList(user.userId, filters);
        return ApiResponseDto.success(result, '입양 신청 리스트가 조회되었습니다.');
    }

    @Get('applications/:applicationId')
    @ApiEndpoint({
        summary: '입양 신청 상세 조회',
        description:
            '특정 입양 신청의 상세 정보를 조회합니다. 표준 신청 응답, 커스텀 질문 응답 등 전체 정보를 제공합니다.',
        responseType: AdminApplicationDetailResponseDto,
        isPublic: false,
    })
    async getApplicationDetail(
        @CurrentUser() user: any,
        @Param('applicationId') applicationId: string,
    ): Promise<ApiResponseDto<AdminApplicationDetailResponseDto>> {
        const result = await this.adopterAdminService.getApplicationDetail(user.userId, applicationId);
        return ApiResponseDto.success(result, '입양 신청 상세 정보가 조회되었습니다.');
    }
}
