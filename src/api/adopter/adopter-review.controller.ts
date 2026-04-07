import { Body, Get, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { CreateAdopterReviewUseCase } from './application/use-cases/create-adopter-review.use-case';
import { GetAdopterReviewDetailUseCase } from './application/use-cases/get-adopter-review-detail.use-case';
import { GetAdopterReviewsUseCase } from './application/use-cases/get-adopter-reviews.use-case';
import { ReportAdopterReviewUseCase } from './application/use-cases/report-adopter-review.use-case';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { ReviewCreateRequestDto } from './dto/request/review-create-request.dto';
import { ReviewReportRequestDto } from './dto/request/review-report-request.dto';
import { MyReviewDetailDto } from './dto/response/my-review-detail.dto';
import { MyReviewItemDto } from './dto/response/my-review-item.dto';
import { ReviewCreateResponseDto } from './dto/response/review-create-response.dto';
import { ReviewReportResponseDto } from './dto/response/review-report-response.dto';
import {
    ApiCreateAdopterReviewEndpoint,
    ApiGetAdopterReviewDetailEndpoint,
    ApiGetAdopterReviewsEndpoint,
    ApiReportAdopterReviewEndpoint,
} from './swagger';

@AdopterProtectedController()
export class AdopterReviewController {
    constructor(
        private readonly createAdopterReviewUseCase: CreateAdopterReviewUseCase,
        private readonly reportAdopterReviewUseCase: ReportAdopterReviewUseCase,
        private readonly getAdopterReviewsUseCase: GetAdopterReviewsUseCase,
        private readonly getAdopterReviewDetailUseCase: GetAdopterReviewDetailUseCase,
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

    @Get('reviews')
    @ApiGetAdopterReviewsEndpoint()
    async getMyReviews(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<PaginationResponseDto<MyReviewItemDto>>> {
        const result = await this.getAdopterReviewsUseCase.execute(userId, Number(page), Number(limit));
        return ApiResponseDto.success(result, '내가 작성한 후기 목록이 조회되었습니다.');
    }

    @Get('reviews/:id')
    @ApiGetAdopterReviewDetailEndpoint()
    async getReviewDetail(
        @CurrentUser('userId') userId: string,
        @Param('id') reviewId: string,
    ): Promise<ApiResponseDto<MyReviewDetailDto>> {
        const result = await this.getAdopterReviewDetailUseCase.execute(userId, reviewId);
        return ApiResponseDto.success(result, '후기 세부 정보가 조회되었습니다.');
    }
}
