import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { RefreshAdminTokenUseCase } from './application/use-cases/refresh-admin-token.use-case';
import { AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/auth-admin-response-messages';
import { AuthAdminControllerBase } from './decorator/auth-admin-controller.decorator';
import { RefreshTokenRequestDto } from '../dto/request/refresh-token-request.dto';
import { ApiRefreshAdminTokenEndpoint } from './swagger';

@AuthAdminControllerBase()
export class AuthAdminTokenController {
    constructor(private readonly refreshAdminTokenUseCase: RefreshAdminTokenUseCase) {}

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiRefreshAdminTokenEndpoint()
    async refreshAdminToken(@Body() dto: RefreshTokenRequestDto): Promise<ApiResponseDto<{ accessToken: string }>> {
        const result = await this.refreshAdminTokenUseCase.execute(dto.refreshToken);
        return ApiResponseDto.success(result, AUTH_ADMIN_RESPONSE_MESSAGE_EXAMPLES.adminTokenRefreshed);
    }
}
