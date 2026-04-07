import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CreateInquiryUseCase } from './application/use-cases/create-inquiry.use-case';
import { DeleteInquiryUseCase } from './application/use-cases/delete-inquiry.use-case';
import { GetMyInquiriesUseCase } from './application/use-cases/get-my-inquiries.use-case';
import { UpdateInquiryUseCase } from './application/use-cases/update-inquiry.use-case';
import { InquiryProtectedController } from './decorator/inquiry-controller.decorator';
import {
    InquiryCreateRequestDto,
    InquiryUpdateRequestDto,
} from './dto/request/inquiry-create-request.dto';
import { MyInquiryListQueryRequestDto } from './dto/request/inquiry-query-request.dto';
import { InquiryCreateResponseDto } from './dto/response/inquiry-create-response.dto';
import { InquiryListResponseDto } from './dto/response/inquiry-list-response.dto';
import {
    ApiCreateInquiryEndpoint,
    ApiDeleteInquiryEndpoint,
    ApiGetMyInquiriesEndpoint,
    ApiUpdateInquiryEndpoint,
} from './swagger';

@InquiryProtectedController('adopter')
export class InquiryAdopterController {
    constructor(
        private readonly getMyInquiriesUseCase: GetMyInquiriesUseCase,
        private readonly createInquiryUseCase: CreateInquiryUseCase,
        private readonly updateInquiryUseCase: UpdateInquiryUseCase,
        private readonly deleteInquiryUseCase: DeleteInquiryUseCase,
    ) {}

    @Get('my')
    @ApiGetMyInquiriesEndpoint()
    async getMyInquiries(
        @CurrentUser('userId') userId: string,
        @Query() query: MyInquiryListQueryRequestDto,
    ): Promise<ApiResponseDto<InquiryListResponseDto>> {
        const result = await this.getMyInquiriesUseCase.execute(userId, query.page, query.limit, query.animalType);
        return ApiResponseDto.success(result, '내 질문 목록이 조회되었습니다.');
    }

    @Post()
    @ApiCreateInquiryEndpoint()
    async createInquiry(
        @CurrentUser('userId') userId: string,
        @Body() dto: InquiryCreateRequestDto,
    ): Promise<ApiResponseDto<InquiryCreateResponseDto>> {
        const result = await this.createInquiryUseCase.execute(userId, dto);
        return ApiResponseDto.success(result, '문의가 작성되었습니다.');
    }

    @Patch(':inquiryId')
    @ApiUpdateInquiryEndpoint()
    async updateInquiry(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: InquiryUpdateRequestDto,
    ): Promise<ApiResponseDto<null>> {
        await this.updateInquiryUseCase.execute(inquiryId, userId, dto);
        return ApiResponseDto.success(null, '문의가 수정되었습니다.');
    }

    @Delete(':inquiryId')
    @ApiDeleteInquiryEndpoint()
    async deleteInquiry(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteInquiryUseCase.execute(inquiryId, userId);
        return ApiResponseDto.success(null, '문의가 삭제되었습니다.');
    }
}
