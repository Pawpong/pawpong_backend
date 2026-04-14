import { HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { LogoutResponseDto } from './dto/response/logout-response.dto';
import { AuthLogoutCookieInterceptor } from './presentation/interceptors/auth-logout-cookie.interceptor';
import { ApiLogoutAuthEndpoint } from './swagger';

@AuthPublicController()
export class AuthLogoutController {
    constructor(private readonly logoutUseCase: LogoutUseCase) {}

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(AuthLogoutCookieInterceptor)
    @HttpCode(HttpStatus.OK)
    @ApiLogoutAuthEndpoint()
    async logout(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
    ): Promise<ApiResponseDto<LogoutResponseDto>> {
        const response = await this.logoutUseCase.execute(userId, role);
        return ApiResponseDto.success(response, response.message);
    }
}
