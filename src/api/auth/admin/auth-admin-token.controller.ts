import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { RefreshAdminTokenUseCase } from './application/use-cases/refresh-admin-token.use-case';
import { AuthAdminControllerBase } from './decorator/auth-admin-controller.decorator';
import { AuthAdminResponseMessageService } from './domain/services/auth-admin-response-message.service';
import { RefreshTokenRequestDto } from '../dto/request/refresh-token-request.dto';
import { ApiRefreshAdminTokenEndpoint } from './swagger';

@AuthAdminControllerBase()
export class AuthAdminTokenController {
    constructor(
        private readonly refreshAdminTokenUseCase: RefreshAdminTokenUseCase,
        private readonly authAdminResponseMessageService: AuthAdminResponseMessageService,
    ) {}

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiRefreshAdminTokenEndpoint()
    async refreshAdminToken(@Body() dto: RefreshTokenRequestDto): Promise<ApiResponseDto<{ accessToken: string }>> {
        const result = await this.refreshAdminTokenUseCase.execute(dto.refreshToken);
        return ApiResponseDto.success(result, this.authAdminResponseMessageService.adminTokenRefreshed());
    }
}
