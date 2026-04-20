import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { ApiController } from '../../../common/decorator/swagger.decorator';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';

import { GetSystemHealthUseCase } from './application/use-cases/get-system-health.use-case';
import { SystemHealthFilterRequestDto } from './dto/request/system-health-filter-request.dto';
import { SystemHealthResponseDto } from './dto/response/system-health-response.dto';
import { ApiGetSystemHealthEndpoint } from './swagger/decorators';

/**
 * 플랫폼 Admin — 시스템 헬스 컨트롤러
 *
 * Loki 로그를 분석하여 PM이 읽기 쉬운 형태로 반환합니다.
 */
@ApiController('플랫폼 관리자 — 서버 현황')
@Controller('platform-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PlatformAdminSystemHealthController {
    constructor(private readonly getSystemHealthUseCase: GetSystemHealthUseCase) {}

    /**
     * GET /api/platform-admin/system-health
     */
    @Get('system-health')
    @ApiGetSystemHealthEndpoint()
    async getSystemHealth(
        @CurrentUser() user: any,
        @Query() filter: SystemHealthFilterRequestDto,
    ): Promise<ApiResponseDto<SystemHealthResponseDto>> {
        // now를 컨트롤러에서 단일 생성하여 응답 period와 Loki 쿼리 범위를 일치시킵니다.
        const now = new Date();
        const periodHours = filter.periodHours ?? 24;

        const result = await this.getSystemHealthUseCase.execute(user.userId, filter, now);

        const response: SystemHealthResponseDto = {
            overallStatus: result.overallStatus,
            asOf: now.toISOString(),
            period: {
                from: new Date(now.getTime() - periodHours * 60 * 60 * 1000).toISOString(),
                to: now.toISOString(),
            },
            services: result.services,
            summary: result.summary,
            // groupKey는 도메인 내부 식별자이므로 API 응답에서 제외합니다.
            issueGroups: result.issueGroups.map(({ groupKey: _, ...rest }) => rest),
        };

        return ApiResponseDto.success(response, '서버 현황이 조회되었습니다.');
    }
}
