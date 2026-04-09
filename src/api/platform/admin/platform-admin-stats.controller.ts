import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetPlatformStatsUseCase } from './application/use-cases/get-platform-stats.use-case';
import { PlatformAdminProtectedController } from './decorator/platform-admin-controller.decorator';
import { PlatformAdminResponseMessageService } from './domain/services/platform-admin-response-message.service';
import { StatsFilterRequestDto } from './dto/request/stats-filter-request.dto';
import { AdminStatsResponseDto } from './dto/response/admin-stats-response.dto';
import { ApiGetPlatformStatsEndpoint } from './swagger';

@PlatformAdminProtectedController()
export class PlatformAdminStatsController {
    constructor(
        private readonly getPlatformStatsUseCase: GetPlatformStatsUseCase,
        private readonly platformAdminResponseMessageService: PlatformAdminResponseMessageService,
    ) {}

    @Get('stats')
    @ApiGetPlatformStatsEndpoint()
    async getStats(
        @CurrentUser('userId') userId: string,
        @Query() filter: StatsFilterRequestDto,
    ): Promise<ApiResponseDto<AdminStatsResponseDto>> {
        const result = await this.getPlatformStatsUseCase.execute(userId, filter);
        return ApiResponseDto.success(result, this.platformAdminResponseMessageService.platformStatsRetrieved());
    }
}
