import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';

import { AppVersionAdminService } from './app-version-admin.service';

import { AppVersionCreateRequestDto } from '../dto/request/app-version-create-request.dto';
import { AppVersionUpdateRequestDto } from '../dto/request/app-version-update-request.dto';
import { AppVersionResponseDto } from '../dto/response/app-version-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';

/**
 * 앱 버전 관리 컨트롤러 (관리자 전용)
 * iOS/Android 앱 강제/권장 업데이트 버전 정보 관리
 */
@ApiTags('앱 버전 관리 (관리자)')
@ApiBearerAuth('JWT-Auth')
@Controller('app-version-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AppVersionAdminController {
    constructor(private readonly appVersionAdminService: AppVersionAdminService) {}

    /**
     * 앱 버전 생성 (관리자 전용)
     */
    @Post()
    @ApiOperation({
        summary: '앱 버전 생성',
        description: 'iOS/Android 앱 버전 정보를 생성합니다. isActive: true로 설정하면 앱 체크에 바로 반영됩니다.',
    })
    @ApiResponse({ status: 200, description: '성공', type: AppVersionResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    async createAppVersion(
        @CurrentUser() user: any,
        @Body() createData: AppVersionCreateRequestDto,
    ): Promise<ApiResponseDto<AppVersionResponseDto>> {
        const result = await this.appVersionAdminService.createAppVersion(user.userId, createData);
        return {
            success: true,
            code: 200,
            data: result,
            message: '앱 버전이 생성되었습니다.',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 앱 버전 목록 조회 (관리자 전용)
     */
    @Get()
    @ApiOperation({
        summary: '앱 버전 목록 조회',
        description: '모든 플랫폼의 앱 버전 목록을 최신순으로 조회합니다.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: '페이지 크기', example: 10 })
    @ApiResponse({ status: 200, description: '성공', type: PaginationResponseDto<AppVersionResponseDto> })
    async getAppVersionList(
        @Query() paginationData: PaginationRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<AppVersionResponseDto>>> {
        const result = await this.appVersionAdminService.getAppVersionList(paginationData);
        return {
            success: true,
            code: 200,
            data: result,
            message: '앱 버전 목록 조회 성공',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 앱 버전 수정 (관리자 전용)
     */
    @Patch(':appVersionId')
    @ApiOperation({
        summary: '앱 버전 수정',
        description: '앱 버전 정보를 수정합니다. isActive: false로 설정하면 체크에서 제외됩니다.',
    })
    @ApiResponse({ status: 200, description: '성공', type: AppVersionResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '앱 버전 정보를 찾을 수 없음' })
    async updateAppVersion(
        @CurrentUser() user: any,
        @Param('appVersionId') appVersionId: string,
        @Body() updateData: AppVersionUpdateRequestDto,
    ): Promise<ApiResponseDto<AppVersionResponseDto>> {
        const result = await this.appVersionAdminService.updateAppVersion(appVersionId, user.userId, updateData);
        return {
            success: true,
            code: 200,
            data: result,
            message: '앱 버전이 수정되었습니다.',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 앱 버전 삭제 (관리자 전용)
     */
    @Delete(':appVersionId')
    @ApiOperation({
        summary: '앱 버전 삭제',
        description: '앱 버전 정보를 삭제합니다.',
    })
    @ApiResponse({ status: 200, description: '성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '앱 버전 정보를 찾을 수 없음' })
    async deleteAppVersion(
        @CurrentUser() user: any,
        @Param('appVersionId') appVersionId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.appVersionAdminService.deleteAppVersion(appVersionId, user.userId);
        return {
            success: true,
            code: 200,
            data: null,
            message: '앱 버전이 삭제되었습니다.',
            timestamp: new Date().toISOString(),
        };
    }
}
