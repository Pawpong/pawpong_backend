import { Get, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetAdopterReviewDetailUseCase } from './application/use-cases/get-adopter-review-detail.use-case';
import { GetAdopterReviewsUseCase } from './application/use-cases/get-adopter-reviews.use-case';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { MyReviewDetailDto } from './dto/response/my-review-detail.dto';
import { MyReviewItemDto } from './dto/response/my-review-item.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './domain/services/adopter-response-message.service';
import { ApiGetAdopterReviewDetailEndpoint, ApiGetAdopterReviewsEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterReviewQueryController {
    constructor(
        private readonly getAdopterReviewsUseCase: GetAdopterReviewsUseCase,
        private readonly getAdopterReviewDetailUseCase: GetAdopterReviewDetailUseCase,
    ) {}

    @Get('reviews')
    @ApiGetAdopterReviewsEndpoint()
    async getMyReviews(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<PaginationResponseDto<MyReviewItemDto>>> {
        const result = await this.getAdopterReviewsUseCase.execute(userId, Number(page), Number(limit));
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.reviewListRetrieved);
    }

    @Get('reviews/:id')
    @ApiGetAdopterReviewDetailEndpoint()
    async getReviewDetail(
        @CurrentUser('userId') userId: string,
        @Param('id') reviewId: string,
    ): Promise<ApiResponseDto<MyReviewDetailDto>> {
        const result = await this.getAdopterReviewDetailUseCase.execute(userId, reviewId);
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.reviewDetailRetrieved);
    }
}
