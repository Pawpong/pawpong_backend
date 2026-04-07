import { Body, Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { HandleBreederReportUseCase } from './application/use-cases/handle-breeder-report.use-case';
import { BreederReportAdminProtectedController } from './decorator/breeder-report-admin-controller.decorator';
import { ReportActionRequestDto } from './dto/request/report-action-request.dto';
import { ReportActionResponseDto } from './dto/response/report-action-response.dto';
import { ApiHandleBreederReportAdminEndpoint } from './swagger';

@BreederReportAdminProtectedController()
export class BreederReportAdminCommandController {
    constructor(private readonly handleBreederReportUseCase: HandleBreederReportUseCase) {}

    @Patch('reports/:reportId')
    @ApiHandleBreederReportAdminEndpoint()
    async handleReport(
        @CurrentUser('userId') adminId: string,
        @Param('reportId') reportId: string,
        @Body() actionData: ReportActionRequestDto,
    ): Promise<ApiResponseDto<ReportActionResponseDto>> {
        const result = await this.handleBreederReportUseCase.execute(adminId, reportId, actionData);
        const message =
            actionData.action === 'resolve' ? '신고가 승인되었습니다. 브리더가 제재됩니다.' : '신고가 반려되었습니다.';
        return ApiResponseDto.success(result, message);
    }
}
