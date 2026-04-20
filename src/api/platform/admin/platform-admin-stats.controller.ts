import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetPlatformStatsUseCase } from './application/use-cases/get-platform-stats.use-case';
import type { PlatformAdminStatsResult } from './application/types/platform-admin-result.type';
import { PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/platform-admin-response-messages';
import { PlatformAdminProtectedController } from './decorator/platform-admin-controller.decorator';
import { StatsFilterRequestDto } from './dto/request/stats-filter-request.dto';
import { AdminStatsResponseDto } from './dto/response/admin-stats-response.dto';
import { ApiGetPlatformStatsEndpoint } from './swagger';

@PlatformAdminProtectedController()
export class PlatformAdminStatsController {
    constructor(private readonly getPlatformStatsUseCase: GetPlatformStatsUseCase) {}

    @Get('stats')
    @ApiGetPlatformStatsEndpoint()
    async getStats(
        @CurrentUser('userId') userId: string,
        @Query() filter: StatsFilterRequestDto,
    ): Promise<ApiResponseDto<AdminStatsResponseDto>> {
        const result = await this.getPlatformStatsUseCase.execute(userId, filter);
        return ApiResponseDto.success(
            result as AdminStatsResponseDto & PlatformAdminStatsResult,
            PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES.platformStatsRetrieved,
        );
    }
}
