import { Body, Get, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CreateInquiryAnswerUseCase } from './application/use-cases/create-inquiry-answer.use-case';
import { GetBreederInquiriesUseCase } from './application/use-cases/get-breeder-inquiries.use-case';
import { InquiryProtectedController } from './decorator/inquiry-controller.decorator';
import { InquiryAnswerCreateRequestDto } from './dto/request/inquiry-create-request.dto';
import { BreederInquiryListQueryRequestDto } from './dto/request/inquiry-query-request.dto';
import { InquiryListResponseDto } from './dto/response/inquiry-list-response.dto';
import { ApiCreateInquiryAnswerEndpoint, ApiGetBreederInquiriesEndpoint } from './swagger';

@InquiryProtectedController('breeder')
export class InquiryBreederController {
    constructor(
        private readonly getBreederInquiriesUseCase: GetBreederInquiriesUseCase,
        private readonly createInquiryAnswerUseCase: CreateInquiryAnswerUseCase,
    ) {}

    @Get('breeder')
    @ApiGetBreederInquiriesEndpoint()
    async getBreederInquiries(
        @CurrentUser('userId') userId: string,
        @Query() query: BreederInquiryListQueryRequestDto,
    ): Promise<ApiResponseDto<InquiryListResponseDto>> {
        const result = await this.getBreederInquiriesUseCase.execute(userId, query.answered, query.page, query.limit);
        return ApiResponseDto.success(result, '브리더 문의 목록이 조회되었습니다.');
    }

    @Post(':inquiryId/answer')
    @ApiCreateInquiryAnswerEndpoint()
    async createAnswer(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: InquiryAnswerCreateRequestDto,
    ): Promise<ApiResponseDto<null>> {
        await this.createInquiryAnswerUseCase.execute(inquiryId, userId, dto);
        return ApiResponseDto.success(null, '답변이 작성되었습니다.');
    }
}
