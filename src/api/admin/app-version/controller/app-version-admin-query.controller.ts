import { Get, Query } from '@nestjs/common';

import { PaginationRequestDto } from '../../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { GetAppVersionListUseCase } from '../application/use-cases/get-app-version-list.use-case';
import { AppVersionAdminProtectedController } from '../decorator/app-version-admin-controller.decorator';
import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../../../service/app-version/constants/app-version-response-messages';
import { AppVersionResponseDto } from '../../../service/app-version/dto/response/app-version-response.dto';
import { ApiGetAppVersionListAdminEndpoint } from '../swagger/index';

@AppVersionAdminProtectedController()
export class AppVersionAdminQueryController {
    constructor(private readonly getAppVersionListUseCase: GetAppVersionListUseCase) {}

    @Get()
    @ApiGetAppVersionListAdminEndpoint()
    async getAppVersionList(
        @Query() paginationData: PaginationRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<AppVersionResponseDto>>> {
        const result = await this.getAppVersionListUseCase.execute(paginationData);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionListRetrieved,
        );
    }
}
