import { Body, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CreateAdopterReviewUseCase } from './application/use-cases/create-adopter-review.use-case';
import { ReportAdopterReviewUseCase } from './application/use-cases/report-adopter-review.use-case';
import type { AdopterReviewCreateResult, AdopterReviewReportResult } from './application/types/adopter-result.type';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { ReviewCreateRequestDto } from './dto/request/review-create-request.dto';
import { ReviewReportRequestDto } from './dto/request/review-report-request.dto';
import { ReviewCreateResponseDto } from './dto/response/review-create-response.dto';
import { ReviewReportResponseDto } from './dto/response/review-report-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './constants/adopter-response-messages';
import { ApiCreateAdopterReviewEndpoint, ApiReportAdopterReviewEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterReviewCommandController {
    constructor(
        private readonly createAdopterReviewUseCase: CreateAdopterReviewUseCase,
        private readonly reportAdopterReviewUseCase: ReportAdopterReviewUseCase,
    ) {}

    @Post('review')
    @ApiCreateAdopterReviewEndpoint()
    async createReview(
        @CurrentUser('userId') userId: string,
        @Body() createReviewDto: ReviewCreateRequestDto,
    ): Promise<ApiResponseDto<ReviewCreateResponseDto>> {
        const result = await this.createAdopterReviewUseCase.execute(userId, createReviewDto);
        return ApiResponseDto.success(
            result as ReviewCreateResponseDto & AdopterReviewCreateResult,
            ADOPTER_RESPONSE_MESSAGES.reviewCreated,
        );
    }

    @Post('report/review')
    @ApiReportAdopterReviewEndpoint()
    async reportReview(
        @CurrentUser('userId') userId: string,
        @Body() reportDto: ReviewReportRequestDto,
    ): Promise<ApiResponseDto<ReviewReportResponseDto>> {
        const result = await this.reportAdopterReviewUseCase.execute(userId, reportDto);
        return ApiResponseDto.success(
            result as ReviewReportResponseDto & AdopterReviewReportResult,
            ADOPTER_RESPONSE_MESSAGES.reviewReported,
        );
    }
}
