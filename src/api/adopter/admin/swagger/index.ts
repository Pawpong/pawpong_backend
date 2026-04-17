import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

import { ApplicationStatus } from '../../../../common/enum/user.enum';
import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from '../../constants/adopter-response-messages';
import {
    ADOPTER_ADMIN_APPLICATION_NOT_FOUND_RESPONSE,
    ADOPTER_ADMIN_FORBIDDEN_RESPONSE,
    ADOPTER_ADMIN_REVIEW_NOT_FOUND_RESPONSE,
} from '../../constants/adopter-swagger.constants';
import { AdminApplicationDetailResponseDto } from '../dto/response/application-detail-response.dto';
import { AdminApplicationListResponseDto } from '../dto/response/application-list-response.dto';
import { ReviewDeleteResponseDto } from '../dto/response/review-delete-response.dto';
import { ReviewReportItemDto } from '../dto/response/review-report-list.dto';

export function ApiAdopterAdminController() {
    return ApiController('입양자 관리 (Admin)');
}

export function ApiGetAdopterAdminReviewReportsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '후기 신고 목록 조회',
            description:
                '신고된 후기 목록을 조회합니다. 입양자가 신고한 부적절한 후기들을 관리자가 검토할 수 있습니다.',
            responseType: PaginationResponseDto,
            itemType: ReviewReportItemDto,
            errorResponses: [ADOPTER_ADMIN_FORBIDDEN_RESPONSE],
            successDescription: '후기 신고 목록 조회 성공',
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.adminReviewReportListRetrieved,
        }),
        ApiQuery({ name: 'page', required: false, type: String, example: '1', description: '페이지 번호' }),
        ApiQuery({ name: 'limit', required: false, type: String, example: '10', description: '페이지당 항목 수' }),
    );
}

export function ApiDeleteAdopterAdminReviewEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '부적절한 후기 삭제',
            description: '신고된 부적절한 후기를 삭제합니다.',
            responseType: ReviewDeleteResponseDto,
            errorResponses: [ADOPTER_ADMIN_FORBIDDEN_RESPONSE, ADOPTER_ADMIN_REVIEW_NOT_FOUND_RESPONSE],
            successDescription: '후기 삭제 성공',
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.adminReviewDeleted,
        }),
        ApiParam({
            name: 'breederId',
            description: '후기 소유 브리더 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiParam({
            name: 'reviewId',
            description: '삭제할 후기 ID',
            example: '507f1f77bcf86cd799439012',
        }),
    );
}

export function ApiGetAdopterAdminApplicationListEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '입양 신청 리스트 조회',
            description: '전체 입양 신청 내역을 조회합니다. 페이지네이션, 필터링, 통계 정보를 함께 제공합니다.',
            responseType: AdminApplicationListResponseDto,
            errorResponses: [ADOPTER_ADMIN_FORBIDDEN_RESPONSE],
            successDescription: '입양 신청 목록 조회 성공',
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.adminApplicationListRetrieved,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: '페이지 번호' }),
        ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: '페이지당 항목 수' }),
        ApiQuery({
            name: 'status',
            required: false,
            enum: ApplicationStatus,
            description: '신청 상태 필터',
        }),
        ApiQuery({ name: 'breederName', required: false, type: String, description: '브리더 이름 검색' }),
        ApiQuery({ name: 'startDate', required: false, type: String, description: '조회 시작일 (YYYY-MM-DD)' }),
        ApiQuery({ name: 'endDate', required: false, type: String, description: '조회 종료일 (YYYY-MM-DD)' }),
    );
}

export function ApiGetAdopterAdminApplicationDetailEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '입양 신청 상세 조회',
            description:
                '특정 입양 신청의 상세 정보를 조회합니다. 표준 신청 응답, 커스텀 질문 응답 등 전체 정보를 제공합니다.',
            responseType: AdminApplicationDetailResponseDto,
            errorResponses: [ADOPTER_ADMIN_FORBIDDEN_RESPONSE, ADOPTER_ADMIN_APPLICATION_NOT_FOUND_RESPONSE],
            successDescription: '입양 신청 상세 조회 성공',
            successMessageExample: ADOPTER_RESPONSE_MESSAGES.adminApplicationDetailRetrieved,
        }),
        ApiParam({
            name: 'applicationId',
            description: '조회할 입양 신청 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
