import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederInquiriesUseCase } from './application/use-cases/get-breeder-inquiries.use-case';
import type { InquiryListResult } from './application/types/inquiry-result.type';
import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from './constants/inquiry-response-messages';
import { InquiryProtectedController } from './decorator/inquiry-controller.decorator';
import { BreederInquiryListQueryRequestDto } from './dto/request/inquiry-query-request.dto';
import { InquiryListResponseDto } from './dto/response/inquiry-list-response.dto';
import { ApiGetBreederInquiriesEndpoint } from './swagger';

@InquiryProtectedController('breeder')
export class InquiryBreederQueryController {
    constructor(private readonly getBreederInquiriesUseCase: GetBreederInquiriesUseCase) {}

    @Get('breeder')
    @ApiGetBreederInquiriesEndpoint()
    async getBreederInquiries(
        @CurrentUser('userId') userId: string,
        @Query() query: BreederInquiryListQueryRequestDto,
    ): Promise<ApiResponseDto<InquiryListResponseDto>> {
        const result = await this.getBreederInquiriesUseCase.execute(userId, query.answered, query.page, query.limit);
        return ApiResponseDto.success(
            result as InquiryListResponseDto & InquiryListResult,
            INQUIRY_RESPONSE_MESSAGE_EXAMPLES.breederInquiriesRetrieved,
        );
    }
}
