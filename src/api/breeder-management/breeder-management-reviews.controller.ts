import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint, ApiPaginatedEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AddBreederManagementReviewReplyUseCase } from './application/use-cases/add-breeder-management-review-reply.use-case';
import { GetBreederManagementMyReviewsUseCase } from './application/use-cases/get-breeder-management-my-reviews.use-case';
import { RemoveBreederManagementReviewReplyUseCase } from './application/use-cases/remove-breeder-management-review-reply.use-case';
import { UpdateBreederManagementReviewReplyUseCase } from './application/use-cases/update-breeder-management-review-reply.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { ReviewReplyRequestDto } from './dto/request/review-reply-request.dto';
import { MyReviewsListResponseDto } from './dto/response/my-reviews-list-response.dto';
import { ReviewReplyDeleteResponseDto, ReviewReplyResponseDto } from './dto/response/review-reply-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementReviewsController {
    constructor(
        private readonly getBreederManagementMyReviewsUseCase: GetBreederManagementMyReviewsUseCase,
        private readonly addBreederManagementReviewReplyUseCase: AddBreederManagementReviewReplyUseCase,
        private readonly updateBreederManagementReviewReplyUseCase: UpdateBreederManagementReviewReplyUseCase,
        private readonly removeBreederManagementReviewReplyUseCase: RemoveBreederManagementReviewReplyUseCase,
    ) {}

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

    @Post('reviews/:reviewId/reply')
    @ApiEndpoint(BreederManagementSwaggerDocs.addReviewReply)
    async addReviewReply(
        @CurrentUser('userId') userId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: ReviewReplyRequestDto,
    ): Promise<ApiResponseDto<ReviewReplyResponseDto>> {
        const result = await this.addBreederManagementReviewReplyUseCase.execute(userId, reviewId, dto.content);
        return ApiResponseDto.success(result, '답글이 등록되었습니다.');
    }

    @Patch('reviews/:reviewId/reply')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateReviewReply)
    async updateReviewReply(
        @CurrentUser('userId') userId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: ReviewReplyRequestDto,
    ): Promise<ApiResponseDto<ReviewReplyResponseDto>> {
        const result = await this.updateBreederManagementReviewReplyUseCase.execute(userId, reviewId, dto.content);
        return ApiResponseDto.success(result, '답글이 수정되었습니다.');
    }

    @Delete('reviews/:reviewId/reply')
    @ApiEndpoint(BreederManagementSwaggerDocs.deleteReviewReply)
    async deleteReviewReply(
        @CurrentUser('userId') userId: string,
        @Param('reviewId') reviewId: string,
    ): Promise<ApiResponseDto<ReviewReplyDeleteResponseDto>> {
        const result = await this.removeBreederManagementReviewReplyUseCase.execute(userId, reviewId);
        return ApiResponseDto.success(result, '답글이 삭제되었습니다.');
    }
}
