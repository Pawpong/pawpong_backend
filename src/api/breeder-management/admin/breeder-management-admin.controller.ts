import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    HttpCode,
    HttpStatus,
    Put,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../common/decorator/swagger.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';

import { BreederManagementAdminService } from './breeder-management-admin.service';

import { ProfileBannerCreateRequestDto } from './dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from './dto/request/profile-banner-update-request.dto';
import { ProfileBannerResponseDto } from './dto/response/profile-banner-response.dto';

@ApiController('브리더 관리 어드민')
@Controller('breeder-management-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreederManagementAdminController {
    constructor(private readonly breederManagementService: BreederManagementAdminService) {}

    // ==================== 프로필 배너 관리 ====================

    @Get('profile-banners')
    @ApiEndpoint({
        summary: '프로필 배너 전체 목록 조회 (관리자)',
        description: '활성/비활성 포함 모든 프로필 배너를 조회합니다.',
        responseType: [ProfileBannerResponseDto],
        isPublic: false,
    })
    async getAllProfileBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.breederManagementService.getAllProfileBanners();
        return ApiResponseDto.success(banners, '프로필 배너 목록이 조회되었습니다.');
    }

    @Get('profile-banners/active')
    @ApiEndpoint({
        summary: '활성화된 프로필 배너 목록 조회 (공개)',
        description: '프로필 페이지에 표시할 활성화된 배너만 조회합니다. 인증 없이 접근 가능합니다.',
        responseType: [ProfileBannerResponseDto],
        isPublic: true,
    })
    async getActiveProfileBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.breederManagementService.getActiveProfileBanners();
        return ApiResponseDto.success(banners, '활성화된 프로필 배너가 조회되었습니다.');
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
        const banner = await this.breederManagementService.createProfileBanner(data);
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
        const banner = await this.breederManagementService.updateProfileBanner(bannerId, data);
        return ApiResponseDto.success(banner, '프로필 배너가 수정되었습니다.');
    }

    @Delete('profile-banner/:bannerId')
    @ApiEndpoint({
        summary: '프로필 배너 삭제',
        description: '프로필 배너를 삭제합니다.',
        isPublic: false,
    })
    async deleteProfileBanner(@Param('bannerId') bannerId: string): Promise<ApiResponseDto<null>> {
        await this.breederManagementService.deleteProfileBanner(bannerId);
        return ApiResponseDto.success(null, '프로필 배너가 삭제되었습니다.');
    }
}
