import { Get, Param, Query } from '@nestjs/common';

import { Public } from '../../common/decorator/public.decorator';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetInquiryDetailUseCase } from './application/use-cases/get-inquiry-detail.use-case';
import { GetInquiryListUseCase } from './application/use-cases/get-inquiry-list.use-case';
import { InquiryPublicController } from './decorator/inquiry-controller.decorator';
import { InquiryListQueryRequestDto } from './dto/request/inquiry-query-request.dto';
import { InquiryDetailResponseDto } from './dto/response/inquiry-detail-response.dto';
import { InquiryListResponseDto } from './dto/response/inquiry-list-response.dto';
import { ApiGetInquiryDetailEndpoint, ApiGetInquiryListEndpoint } from './swagger';

@InquiryPublicController()
export class InquiryPublicHttpController {
    constructor(
        private readonly getInquiryListUseCase: GetInquiryListUseCase,
        private readonly getInquiryDetailUseCase: GetInquiryDetailUseCase,
    ) {}

    @Public()
    @Get()
    @ApiGetInquiryListEndpoint()
    async getInquiryList(
        @Query() query: InquiryListQueryRequestDto,
    ): Promise<ApiResponseDto<InquiryListResponseDto>> {
        const result = await this.getInquiryListUseCase.execute(query.page, query.limit, query.animalType, query.sort);
        return ApiResponseDto.success(result, '문의 목록이 조회되었습니다.');
    }

    @Public()
    @Get(':inquiryId')
    @ApiGetInquiryDetailEndpoint()
    async getInquiryDetail(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<InquiryDetailResponseDto>> {
        const result = await this.getInquiryDetailUseCase.execute(inquiryId, userId);
        return ApiResponseDto.success(result, '문의 상세가 조회되었습니다.');
    }
}
