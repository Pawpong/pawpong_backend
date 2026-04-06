import { Injectable } from '@nestjs/common';

import { ReportListRequestDto } from './dto/request/report-list-request.dto';
import { ReportActionRequestDto } from './dto/request/report-action-request.dto';
import { ReportActionResponseDto } from './dto/response/report-action-response.dto';
import { GetBreederReportsUseCase } from './application/use-cases/get-breeder-reports.use-case';
import { HandleBreederReportUseCase } from './application/use-cases/handle-breeder-report.use-case';

/**
 * 브리더 신고 관리 Admin 서비스
 *
 * 관리자가 브리더 신고를 관리하는 비즈니스 로직을 제공합니다.
 */
@Injectable()
export class BreederReportAdminService {
    constructor(
        private readonly getBreederReportsUseCase: GetBreederReportsUseCase,
        private readonly handleBreederReportUseCase: HandleBreederReportUseCase,
    ) {}

    /**
     * 브리더 신고 목록 조회
     *
     * @param adminId 관리자 고유 ID
     * @param filter 필터 (상태, 페이지네이션)
     * @returns 신고 목록
     */
    async getReports(adminId: string, filter: ReportListRequestDto): Promise<any> {
        return this.getBreederReportsUseCase.execute(adminId, filter);
    }

    /**
     * 브리더 신고 처리
     *
     * @param adminId 관리자 고유 ID
     * @param reportId 신고 고유 ID
     * @param actionData 처리 액션 데이터
     * @returns 처리 결과
     */
    async handleReport(
        adminId: string,
        reportId: string,
        actionData: ReportActionRequestDto,
    ): Promise<ReportActionResponseDto> {
        return this.handleBreederReportUseCase.execute(adminId, reportId, actionData);
    }
}
