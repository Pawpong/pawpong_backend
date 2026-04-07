import { Body, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RefreshAuthTokenUseCase } from './application/use-cases/refresh-auth-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthHttpCookieService } from './domain/services/auth-http-cookie.service';
import { RefreshTokenRequestDto } from './dto/request/refresh-token-request.dto';
import { LogoutResponseDto } from './dto/response/logout-response.dto';
import { TokenResponseDto } from './dto/response/token-response.dto';
import { ApiLogoutAuthEndpoint, ApiRefreshAuthEndpoint } from './swagger';

@AuthPublicController()
export class AuthSessionController {
    constructor(
        private readonly refreshAuthTokenUseCase: RefreshAuthTokenUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly authHttpCookieService: AuthHttpCookieService,
    ) {}

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiRefreshAuthEndpoint()
    async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto): Promise<ApiResponseDto<TokenResponseDto>> {
        const result = await this.refreshAuthTokenUseCase.execute(refreshTokenDto);
        return ApiResponseDto.success(result, '토큰이 재발급되었습니다.');
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiLogoutAuthEndpoint()
    async logout(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<ApiResponseDto<LogoutResponseDto>> {
        const response = await this.logoutUseCase.execute(userId, role);
        this.authHttpCookieService.clearAuthCookies(res);
        return ApiResponseDto.success(response, '로그아웃되었습니다.');
    }
}
