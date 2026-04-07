import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { StatsFilterRequestDto } from './dto/request/stats-filter-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MvpStatsResponseDto } from './dto/response/mvp-stats-response.dto';
import { AdminStatsResponseDto } from './dto/response/admin-stats-response.dto';
import { GetPlatformMvpStatsUseCase } from './application/use-cases/get-platform-mvp-stats.use-case';
import { GetPlatformStatsUseCase } from './application/use-cases/get-platform-stats.use-case';
import { ApiGetPlatformMvpStatsEndpoint, ApiGetPlatformStatsEndpoint, ApiPlatformAdminController } from './swagger';

/**
 * 플랫폼 Admin 컨트롤러
 *
 * 플랫폼 전체 통계 관련 관리자 기능을 제공합니다:
 * - 플랫폼 통계 조회
 * - MVP 통계 조회
 */
@ApiPlatformAdminController()
@Controller('platform-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PlatformAdminController {
    constructor(
        private readonly getPlatformStatsUseCase: GetPlatformStatsUseCase,
        private readonly getPlatformMvpStatsUseCase: GetPlatformMvpStatsUseCase,
    ) {}

    @Get('stats')
    @ApiGetPlatformStatsEndpoint()
    async getStats(
        @CurrentUser('userId') userId: string,
        @Query() filter: StatsFilterRequestDto,
    ): Promise<ApiResponseDto<AdminStatsResponseDto>> {
        const result = await this.getPlatformStatsUseCase.execute(userId, filter);
        return ApiResponseDto.success(result, '시스템 통계가 조회되었습니다.');
    }

    @Get('mvp-stats')
    @ApiGetPlatformMvpStatsEndpoint()
    async getMvpStats(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<MvpStatsResponseDto>> {
        const result = await this.getPlatformMvpStatsUseCase.execute(userId);
        return ApiResponseDto.success(result, 'MVP 통계가 조회되었습니다.');
    }
}
