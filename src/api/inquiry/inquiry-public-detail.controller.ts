import { Get, Param } from '@nestjs/common';

import { Public } from '../../common/decorator/public.decorator';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetInquiryDetailUseCase } from './application/use-cases/get-inquiry-detail.use-case';
import type { InquiryDetailResult } from './application/types/inquiry-result.type';
import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from './constants/inquiry-response-messages';
import { InquiryPublicController } from './decorator/inquiry-controller.decorator';
import { InquiryDetailResponseDto } from './dto/response/inquiry-detail-response.dto';
import { ApiGetInquiryDetailEndpoint } from './swagger';

@InquiryPublicController()
export class InquiryPublicDetailController {
    constructor(private readonly getInquiryDetailUseCase: GetInquiryDetailUseCase) {}

    @Public()
    @Get(':inquiryId')
    @ApiGetInquiryDetailEndpoint()
    async getInquiryDetail(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<InquiryDetailResponseDto>> {
        const result = await this.getInquiryDetailUseCase.execute(inquiryId, userId);
        return ApiResponseDto.success(
            result as InquiryDetailResponseDto & InquiryDetailResult,
            INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDetailRetrieved,
        );
    }
}
