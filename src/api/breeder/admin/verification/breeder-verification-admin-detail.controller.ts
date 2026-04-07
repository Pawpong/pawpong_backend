import { Get, Param } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { GetBreederDetailUseCase } from './application/use-cases/get-breeder-detail.use-case';
import { GetBreederStatsUseCase } from './application/use-cases/get-breeder-stats.use-case';
import { BreederVerificationAdminProtectedController } from './decorator/breeder-verification-admin-controller.decorator';
import { BreederDetailResponseDto } from './dto/response/breeder-detail-response.dto';
import { BreederStatsResponseDto } from './dto/response/breeder-stats-response.dto';
import { ApiGetBreederDetailAdminEndpoint, ApiGetBreederStatsAdminEndpoint } from './swagger';

@BreederVerificationAdminProtectedController()
export class BreederVerificationAdminDetailController {
    constructor(
        private readonly getBreederDetailUseCase: GetBreederDetailUseCase,
        private readonly getBreederStatsUseCase: GetBreederStatsUseCase,
    ) {}

    @Get('verification/:breederId')
    @ApiGetBreederDetailAdminEndpoint()
    async getBreederDetail(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
    ): Promise<ApiResponseDto<BreederDetailResponseDto>> {
        const result = await this.getBreederDetailUseCase.execute(adminId, breederId);
        return ApiResponseDto.success(result, '브리더 상세 정보가 조회되었습니다.');
    }

    @Get('stats')
    @ApiGetBreederStatsAdminEndpoint()
    async getBreederStats(@CurrentUser('userId') adminId: string): Promise<ApiResponseDto<BreederStatsResponseDto>> {
        const result = await this.getBreederStatsUseCase.execute(adminId);
        return ApiResponseDto.success(result, '브리더 통계가 조회되었습니다.');
    }
}
