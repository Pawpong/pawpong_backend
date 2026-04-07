import { Get } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetPlatformMvpStatsUseCase } from './application/use-cases/get-platform-mvp-stats.use-case';
import { PlatformAdminProtectedController } from './decorator/platform-admin-controller.decorator';
import { MvpStatsResponseDto } from './dto/response/mvp-stats-response.dto';
import { ApiGetPlatformMvpStatsEndpoint } from './swagger';

@PlatformAdminProtectedController()
export class PlatformAdminMvpStatsController {
    constructor(private readonly getPlatformMvpStatsUseCase: GetPlatformMvpStatsUseCase) {}

    @Get('mvp-stats')
    @ApiGetPlatformMvpStatsEndpoint()
    async getMvpStats(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<MvpStatsResponseDto>> {
        const result = await this.getPlatformMvpStatsUseCase.execute(userId);
        return ApiResponseDto.success(result, 'MVP 통계가 조회되었습니다.');
    }
}
