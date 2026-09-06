import { Body, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AnswerSupportInquiryUseCase } from '../application/use-cases/answer-support-inquiry.use-case';
import { HomePublicController } from '../decorator/home-controller.decorator';
import { SupportRateLimitGuard } from '../decorator/support-rate-limit.guard';
import { SupportInquiryRequestDto } from '../dto/request/support-inquiry-request.dto';
import { ApiSupportInquiryEndpoint, ApiSupportFeedbackEndpoint } from '../swagger/support';
import { SubmitSupportFeedbackUseCase } from '../application/use-cases/submit-support-feedback.use-case';

@HomePublicController()
export class HomeSupportController {
    constructor(
        private readonly answer: AnswerSupportInquiryUseCase,
        private readonly feedback: SubmitSupportFeedbackUseCase,
    ) {}

    @Post('support/feedback')
    @HttpCode(200)
    @UseGuards(SupportRateLimitGuard)
    @ApiSupportFeedbackEndpoint()
    async submitFeedback(@Body() body: SupportInquiryRequestDto) {
        return ApiResponseDto.success(await this.feedback.execute(body.question, body.userType), '피드백 접수 완료');
    }

    @Post('support/inquiry')
    @HttpCode(200)
    @UseGuards(SupportRateLimitGuard)
    @ApiSupportInquiryEndpoint()
    async inquire(@Body() body: SupportInquiryRequestDto) {
        return ApiResponseDto.success(await this.answer.execute(body.question, body.userType), 'AI FAQ 안내 조회 성공');
    }
}
