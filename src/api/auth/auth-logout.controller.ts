import { HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthHttpCookieService } from './domain/services/auth-http-cookie.service';
import { LogoutResponseDto } from './dto/response/logout-response.dto';
import { ApiLogoutAuthEndpoint } from './swagger';

@AuthPublicController()
export class AuthLogoutController {
    constructor(
        private readonly logoutUseCase: LogoutUseCase,
        private readonly authHttpCookieService: AuthHttpCookieService,
    ) {}

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
