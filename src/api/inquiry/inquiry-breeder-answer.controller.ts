import { Body, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CreateInquiryAnswerUseCase } from './application/use-cases/create-inquiry-answer.use-case';
import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from './constants/inquiry-response-messages';
import { InquiryProtectedController } from './decorator/inquiry-controller.decorator';
import { InquiryAnswerCreateRequestDto } from './dto/request/inquiry-create-request.dto';
import { ApiCreateInquiryAnswerEndpoint } from './swagger';

@InquiryProtectedController('breeder')
export class InquiryBreederAnswerController {
    constructor(private readonly createInquiryAnswerUseCase: CreateInquiryAnswerUseCase) {}

    @Post(':inquiryId/answer')
    @ApiCreateInquiryAnswerEndpoint()
    async createAnswer(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: InquiryAnswerCreateRequestDto,
    ): Promise<ApiResponseDto<null>> {
        await this.createInquiryAnswerUseCase.execute(inquiryId, userId, dto);
        return ApiResponseDto.success(null, INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryAnswerCreated);
    }
}
