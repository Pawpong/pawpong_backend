import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';

import { AppVersionCreateRequestDto } from '../dto/request/app-version-create-request.dto';
import { AppVersionUpdateRequestDto } from '../dto/request/app-version-update-request.dto';
import { AppVersionResponseDto } from '../dto/response/app-version-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { CreateAppVersionUseCase } from './application/use-cases/create-app-version.use-case';
import { GetAppVersionListUseCase } from './application/use-cases/get-app-version-list.use-case';
import { UpdateAppVersionUseCase } from './application/use-cases/update-app-version.use-case';
import { DeleteAppVersionUseCase } from './application/use-cases/delete-app-version.use-case';
import {
    ApiAppVersionAdminController,
    ApiCreateAppVersionAdminEndpoint,
    ApiDeleteAppVersionAdminEndpoint,
    ApiGetAppVersionListAdminEndpoint,
    ApiUpdateAppVersionAdminEndpoint,
} from './swagger';

/**
 * 앱 버전 관리 컨트롤러 (관리자 전용)
 * iOS/Android 앱 강제/권장 업데이트 버전 정보 관리
 */
@ApiAppVersionAdminController()
@Controller('app-version-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AppVersionAdminController {
    constructor(
        private readonly createAppVersionUseCase: CreateAppVersionUseCase,
        private readonly getAppVersionListUseCase: GetAppVersionListUseCase,
        private readonly updateAppVersionUseCase: UpdateAppVersionUseCase,
        private readonly deleteAppVersionUseCase: DeleteAppVersionUseCase,
    ) {}

    /**
     * 앱 버전 생성 (관리자 전용)
     */
    @Post()
    @ApiCreateAppVersionAdminEndpoint()
    async createAppVersion(
        @CurrentUser() user: any,
        @Body() createData: AppVersionCreateRequestDto,
    ): Promise<ApiResponseDto<AppVersionResponseDto>> {
        const result = await this.createAppVersionUseCase.execute(user.userId, createData);
        return ApiResponseDto.success(result, '앱 버전이 생성되었습니다.');
    }

    /**
     * 앱 버전 목록 조회 (관리자 전용)
     */
    @Get()
    @ApiGetAppVersionListAdminEndpoint()
    async getAppVersionList(
        @Query() paginationData: PaginationRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<AppVersionResponseDto>>> {
        const result = await this.getAppVersionListUseCase.execute(paginationData);
        return ApiResponseDto.success(result, '앱 버전 목록 조회 성공');
    }

    /**
     * 앱 버전 수정 (관리자 전용)
     */
    @Patch(':appVersionId')
    @ApiUpdateAppVersionAdminEndpoint()
    async updateAppVersion(
        @CurrentUser() user: any,
        @Param('appVersionId') appVersionId: string,
        @Body() updateData: AppVersionUpdateRequestDto,
    ): Promise<ApiResponseDto<AppVersionResponseDto>> {
        const result = await this.updateAppVersionUseCase.execute(appVersionId, user.userId, updateData);
        return ApiResponseDto.success(result, '앱 버전이 수정되었습니다.');
    }

    /**
     * 앱 버전 삭제 (관리자 전용)
     */
    @Delete(':appVersionId')
    @ApiDeleteAppVersionAdminEndpoint()
    async deleteAppVersion(
        @CurrentUser() user: any,
        @Param('appVersionId') appVersionId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteAppVersionUseCase.execute(appVersionId, user.userId);
        return ApiResponseDto.success(null, '앱 버전이 삭제되었습니다.');
    }
}
