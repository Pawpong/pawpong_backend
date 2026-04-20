import { Get, Param, Query } from '@nestjs/common';

import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../common/pipe/mongo-object-id.pipe';
import { GetBreederReviewsUseCase } from './application/use-cases/get-breeder-reviews.use-case';
import { BreederOptionalAuthController } from './decorator/breeder-public-controller.decorator';
import { BreederReviewsQueryRequestDto } from './dto/request/breeder-reviews-query-request.dto';
import { BreederReviewItemDto } from './dto/response/breeder-reviews-response.dto';
import { BREEDER_RESPONSE_MESSAGES } from './constants/breeder-response-messages';
import { ApiGetBreederReviewsEndpoint } from './swagger/decorators';

@BreederOptionalAuthController()
export class BreederReviewsController {
    constructor(private readonly getBreederReviewsUseCase: GetBreederReviewsUseCase) {}

    @Get(':id/reviews')
    @ApiGetBreederReviewsEndpoint()
    async getBreederReviews(
        @Param('id', new MongoObjectIdPipe('브리더', '올바르지 않은 브리더 ID 형식입니다.')) breederId: string,
        @Query() query: BreederReviewsQueryRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederReviewItemDto>>> {
        const result = await this.getBreederReviewsUseCase.execute(breederId, query.page, query.limit);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            BREEDER_RESPONSE_MESSAGES.reviewsRetrieved,
        );
    }
}
