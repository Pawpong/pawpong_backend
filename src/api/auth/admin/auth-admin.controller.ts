import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '../../../common/decorator/swagger.decorator';

import { AuthAdminService } from './auth-admin.service';

import { AdminLoginRequestDto } from '../dto/request/admin-login-request.dto';
import { RefreshTokenRequestDto } from '../dto/request/refresh-token-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { AdminLoginResponseDto } from '../dto/response/admin-login-response.dto';

/**
 * 관리자 인증 컨트롤러
 *
 * 관리자 로그인, 토큰 갱신 등 관리자 전용 인증 API를 제공합니다.
 *
 * 배너 관리 기능은 BreederManagementAdminModule (/api/breeder-management-admin)로 이관됨
 *
 * @tag Auth Admin - 관리자 인증
 */
@ApiTags('인증 관리 (Admin)')
@Controller('auth-admin')
export class AuthAdminController {
    constructor(private readonly authAdminService: AuthAdminService) {}

    /**
     * 관리자 로그인
     *
     * 이메일과 비밀번호로 관리자 인증 후 JWT 토큰을 발급받습니다.
     * 관리자 전용 액세스 토큰과 리프레시 토큰을 반환합니다.
     *
     * @param dto - 관리자 로그인 요청 DTO (이메일, 비밀번호)
     * @returns 관리자 정보 및 JWT 토큰
     *
     * @throws UnauthorizedException - 이메일 또는 비밀번호가 올바르지 않을 때
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiEndpoint({
        summary: '관리자 로그인',
        description: '이메일과 비밀번호로 관리자 인증 후 JWT 토큰을 발급받습니다.',
        responseType: AdminLoginResponseDto,
        isPublic: true,
    })
    async loginAdmin(@Body() dto: AdminLoginRequestDto): Promise<ApiResponseDto<AdminLoginResponseDto>> {
        const result = await this.authAdminService.loginAdmin(dto.email, dto.password);
        return ApiResponseDto.success(result, '관리자 로그인이 완료되었습니다.');
    }

    /**
     * 관리자 토큰 갱신
     *
     * Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.
     * 만료된 Access Token을 갱신할 때 사용합니다.
     *
     * @param dto - 리프레시 토큰 요청 DTO
     * @returns 새로운 Access Token
     *
     * @throws UnauthorizedException - 리프레시 토큰이 유효하지 않을 때
     */
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiEndpoint({
        summary: '관리자 토큰 갱신',
        description: 'Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.',
        isPublic: true,
    })
    async refreshAdminToken(@Body() dto: RefreshTokenRequestDto): Promise<ApiResponseDto<{ accessToken: string }>> {
        const result = await this.authAdminService.refreshAdminToken(dto.refreshToken);
        return ApiResponseDto.success(result, '토큰이 갱신되었습니다.');
    }
}
