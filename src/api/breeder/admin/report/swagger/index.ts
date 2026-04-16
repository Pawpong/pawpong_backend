import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { BREEDER_RESPONSE_MESSAGES } from '../../../constants/breeder-response-messages';
import {
    BREEDER_ADMIN_FORBIDDEN_RESPONSE,
    BREEDER_REPORT_ADMIN_NOT_FOUND_RESPONSE,
} from '../../constants/breeder-admin-swagger.constants';
import { ReportActionRequestDto } from '../dto/request/report-action-request.dto';
import { ReportActionResponseDto } from '../dto/response/report-action-response.dto';
import { ReportListResponseDto } from '../dto/response/report-list-response.dto';

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
            errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE],
            successMessageExample: BREEDER_RESPONSE_MESSAGES.breederReportListRetrieved,
        }),
        ApiQuery({ name: 'status', required: false, type: String, description: '신고 상태 필터' }),
        ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: '페이지 번호' }),
        ApiQuery({ name: 'itemsPerPage', required: false, type: Number, example: 10, description: '페이지당 항목 수' }),
    );
}

export function ApiHandleBreederReportAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 신고 처리',
            description: '브리더 신고를 승인(제재) 또는 반려 처리합니다.',
            responseType: ReportActionResponseDto,
            errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE, BREEDER_REPORT_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'reportId',
            description: '처리할 신고 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: ReportActionRequestDto }),
    );
}
