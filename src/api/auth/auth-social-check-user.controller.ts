import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CheckSocialUserUseCase } from './application/use-cases/check-social-user.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { CheckSocialUserRequestDto } from './dto/request/check-social-user-request.dto';
import { SocialCheckUserResponseDto } from './dto/response/social-check-user-response.dto';
import { ApiCheckSocialUserEndpoint } from './swagger';

@AuthPublicController()
export class AuthSocialCheckUserController {
    constructor(private readonly checkSocialUserUseCase: CheckSocialUserUseCase) {}

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
