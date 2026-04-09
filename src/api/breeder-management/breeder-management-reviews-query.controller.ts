import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiPaginatedEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederManagementMyReviewsUseCase } from './application/use-cases/get-breeder-management-my-reviews.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './domain/services/breeder-management-response-message.service';
import { MyReviewsListResponseDto } from './dto/response/my-reviews-list-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementReviewsQueryController {
    constructor(private readonly getBreederManagementMyReviewsUseCase: GetBreederManagementMyReviewsUseCase) {}

    @Get('my-reviews')
    @ApiPaginatedEndpoint(BreederManagementSwaggerDocs.myReviews)
    async getMyReviews(
        @CurrentUser('userId') userId: string,
        @Query('visibility') visibility?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<MyReviewsListResponseDto>> {
        const result = await this.getBreederManagementMyReviewsUseCase.execute(
            userId,
            visibility || 'all',
            Number(page),
            Number(limit),
        );
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.myReviewsRetrieved);
    }
}
