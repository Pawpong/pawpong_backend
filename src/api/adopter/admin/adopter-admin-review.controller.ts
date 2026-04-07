import { Delete, Get, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { DeleteAdopterAdminReviewUseCase } from './application/use-cases/delete-adopter-admin-review.use-case';
import { GetAdopterAdminReviewReportsUseCase } from './application/use-cases/get-adopter-admin-review-reports.use-case';
import { AdopterAdminProtectedController } from './decorator/adopter-admin-controller.decorator';
import { ReviewDeleteResponseDto } from './dto/response/review-delete-response.dto';
import { ReviewReportItemDto } from './dto/response/review-report-list.dto';
import { ApiDeleteAdopterAdminReviewEndpoint, ApiGetAdopterAdminReviewReportsEndpoint } from './swagger';

@AdopterAdminProtectedController()
export class AdopterAdminReviewController {
    constructor(
        private readonly getAdopterAdminReviewReportsUseCase: GetAdopterAdminReviewReportsUseCase,
        private readonly deleteAdopterAdminReviewUseCase: DeleteAdopterAdminReviewUseCase,
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
}
