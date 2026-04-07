import { Body, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CreateAdopterReviewUseCase } from './application/use-cases/create-adopter-review.use-case';
import { ReportAdopterReviewUseCase } from './application/use-cases/report-adopter-review.use-case';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { ReviewCreateRequestDto } from './dto/request/review-create-request.dto';
import { ReviewReportRequestDto } from './dto/request/review-report-request.dto';
import { ReviewCreateResponseDto } from './dto/response/review-create-response.dto';
import { ReviewReportResponseDto } from './dto/response/review-report-response.dto';
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
        return ApiResponseDto.success(result, '후기가 성공적으로 작성되었습니다.');
    }

    @Post('report/review')
    @ApiReportAdopterReviewEndpoint()
    async reportReview(
        @CurrentUser('userId') userId: string,
        @Body() reportDto: ReviewReportRequestDto,
    ): Promise<ApiResponseDto<ReviewReportResponseDto>> {
        const result = await this.reportAdopterReviewUseCase.execute(userId, reportDto);
        return ApiResponseDto.success(result, '후기가 신고되었습니다.');
    }
}
