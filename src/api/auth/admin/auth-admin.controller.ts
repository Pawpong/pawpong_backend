import { Controller, Post, Body, HttpCode, HttpStatus, Get, Put, Delete, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '../../../common/decorator/swagger.decorator';

import { AuthAdminService } from './auth-admin.service';

import { AdminLoginRequestDto } from '../dto/request/admin-login-request.dto';
import { RefreshTokenRequestDto } from '../dto/request/refresh-token-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { AdminLoginResponseDto } from '../dto/response/admin-login-response.dto';
import { ProfileBannerResponseDto } from '../../breeder-management/admin/dto/response/profile-banner-response.dto';
import { CounselBannerResponseDto } from '../../breeder-management/admin/dto/response/counsel-banner-response.dto';
import { ProfileBannerCreateRequestDto } from '../../breeder-management/admin/dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from '../../breeder-management/admin/dto/request/profile-banner-update-request.dto';
import { CounselBannerCreateRequestDto } from '../../breeder-management/admin/dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from '../../breeder-management/admin/dto/request/counsel-banner-update-request.dto';

/**
 * 관리자 인증 컨트롤러
 *
 * 관리자 로그인 등 관리자 전용 인증 API를 제공합니다.
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
     *
     * @example
     * POST /api/auth/admin/login
     * {
     *   "email": "admin@pawpong.com",
     *   "password": "admin1234"
     * }
     *
     * Response:
     * {
     *   "success": true,
     *   "code": 200,
     *   "data": {
     *     "adminId": "507f1f77bcf86cd799439011",
     *     "email": "admin@pawpong.com",
     *     "name": "홍길동",
     *     "adminLevel": "super_admin",
     *     "permissions": {
     *       "canManageUsers": true,
     *       "canManageBreeders": true,
     *       "canManageReports": true,
     *       "canViewStatistics": true,
     *       "canManageAdmins": true
     *     },
     *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *   },
     *   "message": "관리자 로그인이 완료되었습니다.",
     *   "timestamp": "2025-01-15T10:30:00.000Z"
     * }
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
     *
     * @example
     * POST /api/auth-admin/refresh
     * {
     *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     * }
     *
     * Response:
     * {
     *   "success": true,
     *   "code": 200,
     *   "data": {
     *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *   },
     *   "message": "토큰이 갱신되었습니다.",
     *   "timestamp": "2025-01-15T10:35:00.000Z"
     * }
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

    // ==================== 프로필 배너 관리 (관리자 전용) ====================

    @Get('profile-banners')
    @ApiEndpoint({
        summary: '프로필 배너 전체 목록 조회 (관리자)',
        description: '활성/비활성 포함 모든 프로필 배너를 조회합니다.',
        responseType: [ProfileBannerResponseDto],
        isPublic: false,
    })
    async getAllProfileBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.authAdminService.getAllProfileBanners();
        return ApiResponseDto.success(banners, '프로필 배너 목록이 조회되었습니다.');
    }

    @Post('profile-banner')
    @ApiEndpoint({
        summary: '프로필 배너 생성',
        description: '새로운 프로필 배너를 생성합니다.',
        responseType: ProfileBannerResponseDto,
        isPublic: false,
    })
    async createProfileBanner(
        @Body() data: ProfileBannerCreateRequestDto,
    ): Promise<ApiResponseDto<ProfileBannerResponseDto>> {
        const banner = await this.authAdminService.createProfileBanner(data);
        return ApiResponseDto.success(banner, '프로필 배너가 생성되었습니다.');
    }

    @Put('profile-banner/:bannerId')
    @ApiEndpoint({
        summary: '프로필 배너 수정',
        description: '기존 프로필 배너를 수정합니다.',
        responseType: ProfileBannerResponseDto,
        isPublic: false,
    })
    async updateProfileBanner(
        @Param('bannerId') bannerId: string,
        @Body() data: ProfileBannerUpdateRequestDto,
    ): Promise<ApiResponseDto<ProfileBannerResponseDto>> {
        const banner = await this.authAdminService.updateProfileBanner(bannerId, data);
        return ApiResponseDto.success(banner, '프로필 배너가 수정되었습니다.');
    }

    @Delete('profile-banner/:bannerId')
    @ApiEndpoint({
        summary: '프로필 배너 삭제',
        description: '프로필 배너를 삭제합니다.',
        isPublic: false,
    })
    async deleteProfileBanner(@Param('bannerId') bannerId: string): Promise<ApiResponseDto<null>> {
        await this.authAdminService.deleteProfileBanner(bannerId);
        return ApiResponseDto.success(null, '프로필 배너가 삭제되었습니다.');
    }

    // ==================== 상담 배너 관리 (관리자 전용) ====================

    @Get('counsel-banners')
    @ApiEndpoint({
        summary: '상담 배너 전체 목록 조회 (관리자)',
        description: '활성/비활성 포함 모든 상담 배너를 조회합니다.',
        responseType: [CounselBannerResponseDto],
        isPublic: false,
    })
    async getAllCounselBanners(): Promise<ApiResponseDto<CounselBannerResponseDto[]>> {
        const banners = await this.authAdminService.getAllCounselBanners();
        return ApiResponseDto.success(banners, '상담 배너 목록이 조회되었습니다.');
    }

    @Post('counsel-banner')
    @ApiEndpoint({
        summary: '상담 배너 생성',
        description: '새로운 상담 배너를 생성합니다.',
        responseType: CounselBannerResponseDto,
        isPublic: false,
    })
    async createCounselBanner(
        @Body() data: CounselBannerCreateRequestDto,
    ): Promise<ApiResponseDto<CounselBannerResponseDto>> {
        const banner = await this.authAdminService.createCounselBanner(data);
        return ApiResponseDto.success(banner, '상담 배너가 생성되었습니다.');
    }

    @Put('counsel-banner/:bannerId')
    @ApiEndpoint({
        summary: '상담 배너 수정',
        description: '기존 상담 배너를 수정합니다.',
        responseType: CounselBannerResponseDto,
        isPublic: false,
    })
    async updateCounselBanner(
        @Param('bannerId') bannerId: string,
        @Body() data: CounselBannerUpdateRequestDto,
    ): Promise<ApiResponseDto<CounselBannerResponseDto>> {
        const banner = await this.authAdminService.updateCounselBanner(bannerId, data);
        return ApiResponseDto.success(banner, '상담 배너가 수정되었습니다.');
    }

    @Delete('counsel-banner/:bannerId')
    @ApiEndpoint({
        summary: '상담 배너 삭제',
        description: '상담 배너를 삭제합니다.',
        isPublic: false,
    })
    async deleteCounselBanner(@Param('bannerId') bannerId: string): Promise<ApiResponseDto<null>> {
        await this.authAdminService.deleteCounselBanner(bannerId);
        return ApiResponseDto.success(null, '상담 배너가 삭제되었습니다.');
    }
}
