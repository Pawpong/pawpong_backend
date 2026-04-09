import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CheckSocialUserUseCase } from './application/use-cases/check-social-user.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthLookupResponseMessageService } from './domain/services/auth-lookup-response-message.service';
import { CheckSocialUserRequestDto } from './dto/request/check-social-user-request.dto';
import { SocialCheckUserResponseDto } from './dto/response/social-check-user-response.dto';
import { ApiCheckSocialUserEndpoint } from './swagger';

@AuthPublicController()
export class AuthSocialCheckUserController {
    constructor(
        private readonly checkSocialUserUseCase: CheckSocialUserUseCase,
        private readonly authLookupResponseMessageService: AuthLookupResponseMessageService,
    ) {}

    @Post('social/check-user')
    @HttpCode(HttpStatus.OK)
    @ApiCheckSocialUserEndpoint()
    async checkSocialUser(
        @Body() dto: CheckSocialUserRequestDto,
    ): Promise<ApiResponseDto<SocialCheckUserResponseDto>> {
        const result = await this.checkSocialUserUseCase.execute(dto.provider, dto.providerId, dto.email);
        return ApiResponseDto.success(
            result,
            this.authLookupResponseMessageService.getSocialUserCheckMessage(result.exists),
        );
    }
}
