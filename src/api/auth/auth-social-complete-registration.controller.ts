import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CompleteSocialRegistrationUseCase } from './application/use-cases/complete-social-registration.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { SocialCompleteRequestDto } from './dto/request/social-complete-request.dto';
import { RegisterAdopterResponseDto } from './dto/response/register-adopter-response.dto';
import { RegisterBreederResponseDto } from './dto/response/register-breeder-response.dto';
import { ApiCompleteSocialRegistrationEndpoint } from './swagger';

@AuthPublicController()
export class AuthSocialCompleteRegistrationController {
    constructor(private readonly completeSocialRegistrationUseCase: CompleteSocialRegistrationUseCase) {}

    @Post('social/complete')
    @HttpCode(HttpStatus.OK)
    @ApiCompleteSocialRegistrationEndpoint()
    async completeSocialRegistration(
        @Body() dto: SocialCompleteRequestDto,
    ): Promise<ApiResponseDto<RegisterAdopterResponseDto | RegisterBreederResponseDto>> {
        const result = await this.completeSocialRegistrationUseCase.execute(dto);
        const message =
            dto.role === 'adopter' ? '입양자 회원가입이 완료되었습니다.' : '브리더 회원가입이 완료되었습니다.';
        return ApiResponseDto.success(result, message);
    }
}
