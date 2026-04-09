import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { GetBreederReportsUseCase } from './application/use-cases/get-breeder-reports.use-case';
import { BreederReportAdminProtectedController } from './decorator/breeder-report-admin-controller.decorator';
import { ReportListRequestDto } from './dto/request/report-list-request.dto';
import { ReportListResponseDto } from './dto/response/report-list-response.dto';
import { BREEDER_RESPONSE_MESSAGES } from '../../domain/services/breeder-response-message.service';
import { ApiGetBreederReportsAdminEndpoint } from './swagger';

@BreederReportAdminProtectedController()
export class BreederReportAdminQueryController {
    constructor(private readonly getBreederReportsUseCase: GetBreederReportsUseCase) {}

    @Get('reports')
    @ApiGetBreederReportsAdminEndpoint()
    async getReports(
        @CurrentUser('userId') adminId: string,
        @Query() filter: ReportListRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<ReportListResponseDto>>> {
        const result = await this.getBreederReportsUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.breederReportListRetrieved);
    }
}
