import { Injectable } from '@nestjs/common';

import { AppVersionCreateRequestDto } from '../dto/request/app-version-create-request.dto';
import { AppVersionUpdateRequestDto } from '../dto/request/app-version-update-request.dto';
import { AppVersionResponseDto } from '../dto/response/app-version-response.dto';
import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { CreateAppVersionUseCase } from './application/use-cases/create-app-version.use-case';
import { GetAppVersionListUseCase } from './application/use-cases/get-app-version-list.use-case';
import { UpdateAppVersionUseCase } from './application/use-cases/update-app-version.use-case';
import { DeleteAppVersionUseCase } from './application/use-cases/delete-app-version.use-case';

/**
 * 앱 버전 관리 서비스 (관리자 전용)
 * 앱 강제/권장 업데이트 버전 정보 CRUD
 */
@Injectable()
export class AppVersionAdminService {
    constructor(
        private readonly createAppVersionUseCase: CreateAppVersionUseCase,
        private readonly getAppVersionListUseCase: GetAppVersionListUseCase,
        private readonly updateAppVersionUseCase: UpdateAppVersionUseCase,
        private readonly deleteAppVersionUseCase: DeleteAppVersionUseCase,
    ) {}

    /**
     * 앱 버전 생성 (관리자 전용)
     */
    async createAppVersion(adminId: string, createData: AppVersionCreateRequestDto): Promise<AppVersionResponseDto> {
        return this.createAppVersionUseCase.execute(adminId, createData);
    }

    /**
     * 앱 버전 목록 조회 (관리자 전용)
     */
    async getAppVersionList(paginationData: PaginationRequestDto): Promise<PaginationResponseDto<AppVersionResponseDto>> {
        return this.getAppVersionListUseCase.execute(paginationData);
    }

    /**
     * 앱 버전 수정 (관리자 전용)
     */
    async updateAppVersion(
        appVersionId: string,
        adminId: string,
        updateData: AppVersionUpdateRequestDto,
    ): Promise<AppVersionResponseDto> {
        return this.updateAppVersionUseCase.execute(appVersionId, adminId, updateData);
    }

    /**
     * 앱 버전 삭제 (관리자 전용)
     */
    async deleteAppVersion(appVersionId: string, adminId: string): Promise<void> {
        return this.deleteAppVersionUseCase.execute(appVersionId, adminId);
    }
}
