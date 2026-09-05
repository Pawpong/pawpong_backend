import { Body, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AnswerSupportInquiryUseCase } from '../application/use-cases/answer-support-inquiry.use-case';
import { HomePublicController } from '../decorator/home-controller.decorator';
import { SupportRateLimitGuard } from '../decorator/support-rate-limit.guard';
import { SupportInquiryRequestDto } from '../dto/request/support-inquiry-request.dto';
import { ApiSupportInquiryEndpoint } from '../swagger/support';

@HomePublicController()
export class HomeSupportController {
    constructor(private readonly answer: AnswerSupportInquiryUseCase) {}

    @Post('support/inquiry')
    @HttpCode(200)
    @UseGuards(SupportRateLimitGuard)
    @ApiSupportInquiryEndpoint()
    async inquire(@Body() body: SupportInquiryRequestDto) {
        return ApiResponseDto.success(await this.answer.execute(body.question, body.userType), 'AI FAQ 안내 조회 성공');
    }
}
