import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CompleteSocialRegistrationUseCase } from './application/use-cases/complete-social-registration.use-case';
import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from './constants/auth-response-messages';
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
        return ApiResponseDto.success(
            result,
            dto.role === 'adopter'
                ? AUTH_RESPONSE_MESSAGE_EXAMPLES.adopterSignupCompleted
                : AUTH_RESPONSE_MESSAGE_EXAMPLES.breederSignupCompleted,
        );
    }
}
