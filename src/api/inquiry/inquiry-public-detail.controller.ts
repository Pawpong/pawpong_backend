import { Get, Param } from '@nestjs/common';

import { Public } from '../../common/decorator/public.decorator';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetInquiryDetailUseCase } from './application/use-cases/get-inquiry-detail.use-case';
import { InquiryPublicController } from './decorator/inquiry-controller.decorator';
import { InquiryPublicQueryResponseMessageService } from './domain/services/inquiry-public-query-response-message.service';
import { InquiryDetailResponseDto } from './dto/response/inquiry-detail-response.dto';
import { ApiGetInquiryDetailEndpoint } from './swagger';

@InquiryPublicController()
export class InquiryPublicDetailController {
    constructor(
        private readonly getInquiryDetailUseCase: GetInquiryDetailUseCase,
        private readonly inquiryPublicQueryResponseMessageService: InquiryPublicQueryResponseMessageService,
    ) {}

    @Public()
    @Get(':inquiryId')
    @ApiGetInquiryDetailEndpoint()
    async getInquiryDetail(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<InquiryDetailResponseDto>> {
        const result = await this.getInquiryDetailUseCase.execute(inquiryId, userId);
        return ApiResponseDto.success(result, this.inquiryPublicQueryResponseMessageService.inquiryDetailRetrieved());
    }
}
