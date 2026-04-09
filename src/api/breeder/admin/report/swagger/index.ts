import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { ReportActionResponseDto } from '../dto/response/report-action-response.dto';
import { ReportListResponseDto } from '../dto/response/report-list-response.dto';
import { BREEDER_RESPONSE_MESSAGES } from '../../../domain/services/breeder-response-message.service';

const BREEDER_REPORT_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
};

export function ApiBreederReportAdminController() {
    return ApiController('브리더 신고 관리 (Admin)');
}

export function ApiGetBreederReportsAdminEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '브리더 신고 목록 조회',
            description: '브리더에 대한 신고 목록을 조회합니다. 상태별 필터링 및 페이지네이션을 지원합니다.',
            responseType: PaginationResponseDto,
            itemType: ReportListResponseDto,
            errorResponses: [BREEDER_REPORT_ADMIN_FORBIDDEN_RESPONSE],
            successMessageExample: BREEDER_RESPONSE_MESSAGES.breederReportListRetrieved,
        }),
        ApiQuery({ name: 'status', required: false, type: String, description: '신고 상태 필터' }),
        ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: '페이지 번호' }),
        ApiQuery({ name: 'itemsPerPage', required: false, type: Number, example: 10, description: '페이지당 항목 수' }),
    );
}

export function ApiHandleBreederReportAdminEndpoint() {
    return ApiEndpoint({
        summary: '브리더 신고 처리',
        description: '브리더 신고를 승인(제재) 또는 반려 처리합니다.',
        responseType: ReportActionResponseDto,
        errorResponses: [
            BREEDER_REPORT_ADMIN_FORBIDDEN_RESPONSE,
            {
                status: 404,
                description: '신고를 찾을 수 없음',
                errorExample: '신고를 찾을 수 없습니다.',
            },
        ],
    });
}
