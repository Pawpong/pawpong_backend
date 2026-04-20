import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { SendPhoneVerificationCodeUseCase } from './application/use-cases/send-phone-verification-code.use-case';
import { VerifyPhoneVerificationCodeUseCase } from './application/use-cases/verify-phone-verification-code.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { SendVerificationCodeRequestDto, VerifyCodeRequestDto } from './dto/request/phone-verification-request.dto';
import { PhoneVerificationResponseDto } from './dto/response/phone-verification-response.dto';
import { ApiSendPhoneVerificationCodeEndpoint, ApiVerifyPhoneVerificationCodeEndpoint } from './swagger';

@AuthPublicController()
export class AuthPhoneController {
    constructor(
        private readonly sendPhoneVerificationCodeUseCase: SendPhoneVerificationCodeUseCase,
        private readonly verifyPhoneVerificationCodeUseCase: VerifyPhoneVerificationCodeUseCase,
    ) {}

    @Post('phone/send-code')
    @HttpCode(HttpStatus.OK)
    @ApiSendPhoneVerificationCodeEndpoint()
    async sendVerificationCode(
        @Body() sendCodeDto: SendVerificationCodeRequestDto,
    ): Promise<ApiResponseDto<PhoneVerificationResponseDto>> {
        const result = await this.sendPhoneVerificationCodeUseCase.execute(sendCodeDto.phone);
        return ApiResponseDto.success(result);
    }

    @Post('phone/verify-code')
    @HttpCode(HttpStatus.OK)
    @ApiVerifyPhoneVerificationCodeEndpoint()
    async verifyCode(
        @Body() verifyCodeDto: VerifyCodeRequestDto,
    ): Promise<ApiResponseDto<PhoneVerificationResponseDto>> {
        const result = await this.verifyPhoneVerificationCodeUseCase.execute(verifyCodeDto.phone, verifyCodeDto.code);
        return ApiResponseDto.success(result);
    }
}
