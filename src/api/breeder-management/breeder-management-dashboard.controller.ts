import { Get } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { BreederDashboardResponseDto } from '../breeder/dto/response/breeder-dashboard-response.dto';
import { GetBreederManagementDashboardUseCase } from './application/use-cases/get-breeder-management-dashboard.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementDashboardController {
    constructor(private readonly getBreederManagementDashboardUseCase: GetBreederManagementDashboardUseCase) {}

    @Get('dashboard')
    @ApiEndpoint(BreederManagementSwaggerDocs.dashboard)
    async getDashboard(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<BreederDashboardResponseDto>> {
        const result = await this.getBreederManagementDashboardUseCase.execute(userId);
        return ApiResponseDto.success(result, '대시보드 정보가 조회되었습니다.');
    }
}
