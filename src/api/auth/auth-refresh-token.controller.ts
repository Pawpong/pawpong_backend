import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { RefreshAuthTokenUseCase } from './application/use-cases/refresh-auth-token.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { RefreshTokenRequestDto } from './dto/request/refresh-token-request.dto';
import { TokenResponseDto } from './dto/response/token-response.dto';
import { ApiRefreshAuthEndpoint } from './swagger';

@AuthPublicController()
export class AuthRefreshTokenController {
    constructor(private readonly refreshAuthTokenUseCase: RefreshAuthTokenUseCase) {}

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiRefreshAuthEndpoint()
    async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto): Promise<ApiResponseDto<TokenResponseDto>> {
        const result = await this.refreshAuthTokenUseCase.execute(refreshTokenDto);
        return ApiResponseDto.success(result, '토큰이 재발급되었습니다.');
    }
}
