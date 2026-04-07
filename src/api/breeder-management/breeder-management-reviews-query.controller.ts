import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiPaginatedEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederManagementMyReviewsUseCase } from './application/use-cases/get-breeder-management-my-reviews.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
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
        return ApiResponseDto.success(result, '후기 목록이 조회되었습니다.');
    }
}
