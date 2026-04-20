import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { LoginAdminUseCase } from './application/use-cases/login-admin.use-case';
import type { AdminLoginResult } from './application/types/auth-admin-result.type';
import { AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/auth-admin-response-messages';
import { AuthAdminControllerBase } from './decorator/auth-admin-controller.decorator';
import { AdminLoginRequestDto } from '../dto/request/admin-login-request.dto';
import { AdminLoginResponseDto } from '../dto/response/admin-login-response.dto';
import { ApiAdminLoginEndpoint } from './swagger';

@AuthAdminControllerBase()
export class AuthAdminLoginController {
    constructor(private readonly loginAdminUseCase: LoginAdminUseCase) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiAdminLoginEndpoint()
    async loginAdmin(@Body() dto: AdminLoginRequestDto): Promise<ApiResponseDto<AdminLoginResponseDto>> {
        const result = await this.loginAdminUseCase.execute(dto.email, dto.password);
        return ApiResponseDto.success(
            result as AdminLoginResponseDto & AdminLoginResult,
            AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES.adminLoginCompleted,
        );
    }
}
