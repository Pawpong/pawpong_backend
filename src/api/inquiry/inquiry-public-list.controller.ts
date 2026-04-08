import { Get, Query } from '@nestjs/common';

import { Public } from '../../common/decorator/public.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetInquiryListUseCase } from './application/use-cases/get-inquiry-list.use-case';
import { InquiryPublicController } from './decorator/inquiry-controller.decorator';
import { InquiryListQueryRequestDto } from './dto/request/inquiry-query-request.dto';
import { InquiryListResponseDto } from './dto/response/inquiry-list-response.dto';
import { ApiGetInquiryListEndpoint } from './swagger';

@InquiryPublicController()
export class InquiryPublicListController {
    constructor(private readonly getInquiryListUseCase: GetInquiryListUseCase) {}

    @Public()
    @Get()
    @ApiGetInquiryListEndpoint()
    async getInquiryList(@Query() query: InquiryListQueryRequestDto): Promise<ApiResponseDto<InquiryListResponseDto>> {
        const result = await this.getInquiryListUseCase.execute(query.page, query.limit, query.animalType, query.sort);
        return ApiResponseDto.success(result, '문의 목록이 조회되었습니다.');
    }
}
