import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { ApplicationListRequestDto } from './dto/request/application-list-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ReviewReportItemDto } from './dto/response/review-report-list.dto';
import { ReviewDeleteResponseDto } from './dto/response/review-delete-response.dto';
import { AdminApplicationListResponseDto } from './dto/response/application-list-response.dto';
import { AdminApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';
import { DeleteAdopterAdminReviewUseCase } from './application/use-cases/delete-adopter-admin-review.use-case';
import { GetAdopterAdminApplicationDetailUseCase } from './application/use-cases/get-adopter-admin-application-detail.use-case';
import { GetAdopterAdminApplicationListUseCase } from './application/use-cases/get-adopter-admin-application-list.use-case';
import { GetAdopterAdminReviewReportsUseCase } from './application/use-cases/get-adopter-admin-review-reports.use-case';
import {
    ApiDeleteAdopterAdminReviewEndpoint,
    ApiGetAdopterAdminApplicationDetailEndpoint,
    ApiGetAdopterAdminApplicationListEndpoint,
    ApiGetAdopterAdminReviewReportsEndpoint,
    ApiAdopterAdminController,
} from './swagger';

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
@ApiAdopterAdminController()
@Controller('adopter-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdopterAdminController {
    constructor(
        private readonly getAdopterAdminReviewReportsUseCase: GetAdopterAdminReviewReportsUseCase,
        private readonly deleteAdopterAdminReviewUseCase: DeleteAdopterAdminReviewUseCase,
        private readonly getAdopterAdminApplicationListUseCase: GetAdopterAdminApplicationListUseCase,
        private readonly getAdopterAdminApplicationDetailUseCase: GetAdopterAdminApplicationDetailUseCase,
    ) {}

    @Get('reviews/reports')
    @ApiGetAdopterAdminReviewReportsEndpoint()
    async getReviewReports(
        @CurrentUser('userId') adminId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ): Promise<ApiResponseDto<PaginationResponseDto<ReviewReportItemDto>>> {
        const result = await this.getAdopterAdminReviewReportsUseCase.execute(adminId, page, limit);
        return ApiResponseDto.success(result, '후기 신고 목록이 조회되었습니다.');
    }

    @Delete('reviews/:breederId/:reviewId')
    @ApiDeleteAdopterAdminReviewEndpoint()
    async deleteReview(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Param('reviewId') reviewId: string,
    ): Promise<ApiResponseDto<ReviewDeleteResponseDto>> {
        const result = await this.deleteAdopterAdminReviewUseCase.execute(adminId, breederId, reviewId);
        return ApiResponseDto.success(result, '부적절한 후기가 삭제되었습니다.');
    }

    // ================== 입양 신청 모니터링 ==================

    @Get('applications')
    @ApiGetAdopterAdminApplicationListEndpoint()
    async getApplicationList(
        @CurrentUser('userId') adminId: string,
        @Query() filters: ApplicationListRequestDto,
    ): Promise<ApiResponseDto<AdminApplicationListResponseDto>> {
        const result = await this.getAdopterAdminApplicationListUseCase.execute(adminId, filters);
        return ApiResponseDto.success(result, '입양 신청 리스트가 조회되었습니다.');
    }

    @Get('applications/:applicationId')
    @ApiGetAdopterAdminApplicationDetailEndpoint()
    async getApplicationDetail(
        @CurrentUser('userId') adminId: string,
        @Param('applicationId') applicationId: string,
    ): Promise<ApiResponseDto<AdminApplicationDetailResponseDto>> {
        const result = await this.getAdopterAdminApplicationDetailUseCase.execute(adminId, applicationId);
        return ApiResponseDto.success(result, '입양 신청 상세 정보가 조회되었습니다.');
    }
}
