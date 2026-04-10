import { Body, Delete, Patch, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CreateAppVersionUseCase } from './application/use-cases/create-app-version.use-case';
import { DeleteAppVersionUseCase } from './application/use-cases/delete-app-version.use-case';
import { UpdateAppVersionUseCase } from './application/use-cases/update-app-version.use-case';
import { AppVersionAdminProtectedController } from './decorator/app-version-admin-controller.decorator';
import { AppVersionAdminDeleteResponseMessageService } from '../domain/services/app-version-admin-delete-response-message.service';
import { AppVersionAdminWriteResponseMessageService } from '../domain/services/app-version-admin-write-response-message.service';
import { AppVersionCreateRequestDto } from '../dto/request/app-version-create-request.dto';
import { AppVersionUpdateRequestDto } from '../dto/request/app-version-update-request.dto';
import { AppVersionResponseDto } from '../dto/response/app-version-response.dto';
import {
    ApiCreateAppVersionAdminEndpoint,
    ApiDeleteAppVersionAdminEndpoint,
    ApiUpdateAppVersionAdminEndpoint,
} from './swagger';

@AppVersionAdminProtectedController()
export class AppVersionAdminCommandController {
    constructor(
        private readonly createAppVersionUseCase: CreateAppVersionUseCase,
        private readonly updateAppVersionUseCase: UpdateAppVersionUseCase,
        private readonly deleteAppVersionUseCase: DeleteAppVersionUseCase,
        private readonly appVersionAdminWriteResponseMessageService: AppVersionAdminWriteResponseMessageService,
        private readonly appVersionAdminDeleteResponseMessageService: AppVersionAdminDeleteResponseMessageService,
    ) {}

    @Post()
    @ApiCreateAppVersionAdminEndpoint()
    async createAppVersion(
        @CurrentUser('userId') userId: string,
        @Body() createData: AppVersionCreateRequestDto,
    ): Promise<ApiResponseDto<AppVersionResponseDto>> {
        const result = await this.createAppVersionUseCase.execute(userId, createData);
        return ApiResponseDto.success(result, this.appVersionAdminWriteResponseMessageService.appVersionCreated());
    }

    @Patch(':appVersionId')
    @ApiUpdateAppVersionAdminEndpoint()
    async updateAppVersion(
        @CurrentUser('userId') userId: string,
        @Param('appVersionId') appVersionId: string,
        @Body() updateData: AppVersionUpdateRequestDto,
    ): Promise<ApiResponseDto<AppVersionResponseDto>> {
        const result = await this.updateAppVersionUseCase.execute(appVersionId, userId, updateData);
        return ApiResponseDto.success(result, this.appVersionAdminWriteResponseMessageService.appVersionUpdated());
    }

    @Delete(':appVersionId')
    @ApiDeleteAppVersionAdminEndpoint()
    async deleteAppVersion(
        @CurrentUser('userId') userId: string,
        @Param('appVersionId') appVersionId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteAppVersionUseCase.execute(appVersionId, userId);
        return ApiResponseDto.success(null, this.appVersionAdminDeleteResponseMessageService.appVersionDeleted());
    }
}
