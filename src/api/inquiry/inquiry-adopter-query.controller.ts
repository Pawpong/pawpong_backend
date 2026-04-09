import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetMyInquiriesUseCase } from './application/use-cases/get-my-inquiries.use-case';
import { InquiryProtectedController } from './decorator/inquiry-controller.decorator';
import { InquiryQueryResponseMessageService } from './domain/services/inquiry-query-response-message.service';
import { MyInquiryListQueryRequestDto } from './dto/request/inquiry-query-request.dto';
import { InquiryListResponseDto } from './dto/response/inquiry-list-response.dto';
import { ApiGetMyInquiriesEndpoint } from './swagger';

@InquiryProtectedController('adopter')
export class InquiryAdopterQueryController {
    constructor(
        private readonly getMyInquiriesUseCase: GetMyInquiriesUseCase,
        private readonly inquiryQueryResponseMessageService: InquiryQueryResponseMessageService,
    ) {}

    @Get('my')
    @ApiGetMyInquiriesEndpoint()
    async getMyInquiries(
        @CurrentUser('userId') userId: string,
        @Query() query: MyInquiryListQueryRequestDto,
    ): Promise<ApiResponseDto<InquiryListResponseDto>> {
        const result = await this.getMyInquiriesUseCase.execute(userId, query.page, query.limit, query.animalType);
        return ApiResponseDto.success(result, this.inquiryQueryResponseMessageService.myInquiriesRetrieved());
    }
}
