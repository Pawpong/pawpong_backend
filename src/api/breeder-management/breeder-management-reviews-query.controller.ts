import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiPaginatedEndpoint } from '../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederManagementMyReviewsUseCase } from './application/use-cases/get-breeder-management-my-reviews.use-case';
import type { BreederManagementMyReviewsPageResult } from './application/types/breeder-management-result.type';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './constants/breeder-management-response-messages';
import { MyReviewsQueryRequestDto } from './dto/request/my-reviews-query-request.dto';
import { MyReviewsListResponseDto } from './dto/response/my-reviews-list-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementReviewsQueryController {
    constructor(private readonly getBreederManagementMyReviewsUseCase: GetBreederManagementMyReviewsUseCase) {}

    @Get('my-reviews')
    @ApiPaginatedEndpoint(BreederManagementSwaggerDocs.myReviews)
    async getMyReviews(
        @CurrentUser('userId') userId: string,
        @Query() query: MyReviewsQueryRequestDto,
    ): Promise<ApiResponseDto<MyReviewsListResponseDto>> {
        const result = await this.getBreederManagementMyReviewsUseCase.execute(
            userId,
            query.visibility || 'all',
            query.page,
            query.limit,
        );
        const response = PaginationResponseDto.fromPageResult(result) as MyReviewsListResponseDto;
        response.averageRating = result.averageRating;
        response.totalReviews = result.totalReviews;
        response.visibleReviews = result.visibleReviews;
        response.hiddenReviews = result.hiddenReviews;

        return ApiResponseDto.success(
            response as MyReviewsListResponseDto & BreederManagementMyReviewsPageResult,
            BREEDER_MANAGEMENT_RESPONSE_MESSAGES.myReviewsRetrieved,
        );
    }
}
