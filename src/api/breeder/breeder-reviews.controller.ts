import { Get, Param, Query } from '@nestjs/common';

import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederReviewsUseCase } from './application/use-cases/get-breeder-reviews.use-case';
import { BreederOptionalAuthController } from './decorator/breeder-public-controller.decorator';
import { BreederReviewItemDto } from './dto/response/breeder-reviews-response.dto';
import { ApiGetBreederReviewsEndpoint } from './swagger/decorators';

@BreederOptionalAuthController()
export class BreederReviewsController {
    constructor(private readonly getBreederReviewsUseCase: GetBreederReviewsUseCase) {}

    @Get(':id/reviews')
    @ApiGetBreederReviewsEndpoint()
    async getBreederReviews(
        @Param('id') breederId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederReviewItemDto>>> {
        const result = await this.getBreederReviewsUseCase.execute(breederId, Number(page), Number(limit));
        return ApiResponseDto.success(result, '후기 목록이 조회되었습니다.');
    }
}
