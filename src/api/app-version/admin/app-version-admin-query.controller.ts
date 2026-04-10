import { Get, Query } from '@nestjs/common';

import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAppVersionListUseCase } from './application/use-cases/get-app-version-list.use-case';
import { AppVersionAdminProtectedController } from './decorator/app-version-admin-controller.decorator';
import { AppVersionAdminQueryResponseMessageService } from '../domain/services/app-version-admin-query-response-message.service';
import { AppVersionResponseDto } from '../dto/response/app-version-response.dto';
import { ApiGetAppVersionListAdminEndpoint } from './swagger';

@AppVersionAdminProtectedController()
export class AppVersionAdminQueryController {
    constructor(
        private readonly getAppVersionListUseCase: GetAppVersionListUseCase,
        private readonly appVersionAdminQueryResponseMessageService: AppVersionAdminQueryResponseMessageService,
    ) {}

    @Get()
    @ApiGetAppVersionListAdminEndpoint()
    async getAppVersionList(
        @Query() paginationData: PaginationRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<AppVersionResponseDto>>> {
        const result = await this.getAppVersionListUseCase.execute(paginationData);
        return ApiResponseDto.success(result, this.appVersionAdminQueryResponseMessageService.appVersionListRetrieved());
    }
}
