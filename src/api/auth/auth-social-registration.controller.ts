import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CheckSocialUserUseCase } from './application/use-cases/check-social-user.use-case';
import { CompleteSocialRegistrationUseCase } from './application/use-cases/complete-social-registration.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { CheckSocialUserRequestDto } from './dto/request/check-social-user-request.dto';
import { SocialCompleteRequestDto } from './dto/request/social-complete-request.dto';
import { RegisterAdopterResponseDto } from './dto/response/register-adopter-response.dto';
import { RegisterBreederResponseDto } from './dto/response/register-breeder-response.dto';
import { SocialCheckUserResponseDto } from './dto/response/social-check-user-response.dto';
import { ApiCheckSocialUserEndpoint, ApiCompleteSocialRegistrationEndpoint } from './swagger';

@AuthPublicController()
export class AuthSocialRegistrationController {
    constructor(
        private readonly checkSocialUserUseCase: CheckSocialUserUseCase,
        private readonly completeSocialRegistrationUseCase: CompleteSocialRegistrationUseCase,
    ) {}

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

    @Post('social/check-user')
    @HttpCode(HttpStatus.OK)
    @ApiCheckSocialUserEndpoint()
    async checkSocialUser(
        @Body() dto: CheckSocialUserRequestDto,
    ): Promise<ApiResponseDto<SocialCheckUserResponseDto>> {
        const result = await this.checkSocialUserUseCase.execute(dto.provider, dto.providerId, dto.email);
        return ApiResponseDto.success(result, result.exists ? '가입된 사용자입니다.' : '미가입 사용자입니다.');
    }
}
