import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AddBreederManagementReviewReplyUseCase } from './application/use-cases/add-breeder-management-review-reply.use-case';
import { RemoveBreederManagementReviewReplyUseCase } from './application/use-cases/remove-breeder-management-review-reply.use-case';
import { UpdateBreederManagementReviewReplyUseCase } from './application/use-cases/update-breeder-management-review-reply.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './domain/services/breeder-management-response-message.service';
import { ReviewReplyRequestDto } from './dto/request/review-reply-request.dto';
import { ReviewReplyDeleteResponseDto, ReviewReplyResponseDto } from './dto/response/review-reply-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementReviewReplyController {
    constructor(
        private readonly addBreederManagementReviewReplyUseCase: AddBreederManagementReviewReplyUseCase,
        private readonly updateBreederManagementReviewReplyUseCase: UpdateBreederManagementReviewReplyUseCase,
        private readonly removeBreederManagementReviewReplyUseCase: RemoveBreederManagementReviewReplyUseCase,
    ) {}

    @Post('reviews/:reviewId/reply')
    @ApiEndpoint(BreederManagementSwaggerDocs.addReviewReply)
    async addReviewReply(
        @CurrentUser('userId') userId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: ReviewReplyRequestDto,
    ): Promise<ApiResponseDto<ReviewReplyResponseDto>> {
        const result = await this.addBreederManagementReviewReplyUseCase.execute(userId, reviewId, dto.content);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyAdded);
    }

    @Patch('reviews/:reviewId/reply')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateReviewReply)
    async updateReviewReply(
        @CurrentUser('userId') userId: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: ReviewReplyRequestDto,
    ): Promise<ApiResponseDto<ReviewReplyResponseDto>> {
        const result = await this.updateBreederManagementReviewReplyUseCase.execute(userId, reviewId, dto.content);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyUpdated);
    }

    @Delete('reviews/:reviewId/reply')
    @ApiEndpoint(BreederManagementSwaggerDocs.deleteReviewReply)
    async deleteReviewReply(
        @CurrentUser('userId') userId: string,
        @Param('reviewId') reviewId: string,
    ): Promise<ApiResponseDto<ReviewReplyDeleteResponseDto>> {
        const result = await this.removeBreederManagementReviewReplyUseCase.execute(userId, reviewId);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyDeleted);
    }
}
