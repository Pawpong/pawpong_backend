import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

import { ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES } from '../constants/community-report-admin-response-messages';
import {
    CommunityReportAdminActionResponseDto,
    CommunityReportAdminItemResponseDto,
} from '../dto/response/community-report-admin-response.dto';

const REPORT_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '신고 없음 또는 이미 처리됨',
    errorExample: COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES.reportNotFound,
} as const;

const REPORT_ID_PARAM = {
    name: 'reportId',
    description: '커뮤니티 신고 ID',
    example: '507f1f77bcf86cd799439011',
} as const;

export function ApiGetCommunityPostReportsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '커뮤니티 신고 목록 조회',
            description: `
                신고된 커뮤니티 게시글을 최신 신고순으로 조회합니다.

                ## 주요 기능
                - status 필터(pending / resolved / dismissed)를 지원합니다.
                - 페이지 번호와 페이지당 항목 수를 조정할 수 있습니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: PaginationResponseDto,
            itemType: CommunityReportAdminItemResponseDto,
            successDescription: '신고 목록 조회 성공',
            successMessageExample: COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES.reportsRetrieved,
        }),
        ApiQuery({
            name: 'status',
            required: false,
            enum: ['pending', 'resolved', 'dismissed'],
            description: '신고 처리 상태 필터',
            example: 'pending',
        }),
    );
}

export function ApiResolveCommunityPostReportEndpoint() {
    return applyDecorators(
        ApiParam(REPORT_ID_PARAM),
        ApiEndpoint({
            summary: '커뮤니티 신고 처리 (숨김)',
            description: `
                신고된 게시글을 숨김(isActive=false) 처리하고 신고 상태를 resolved 로 변경합니다.
                게시글 도큐먼트는 삭제하지 않고 보존합니다.
            `,
            responseType: CommunityReportAdminActionResponseDto,
            successDescription: '신고 처리 성공',
            successMessageExample: COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES.reportResolved,
            errorResponses: [REPORT_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiDismissCommunityPostReportEndpoint() {
    return applyDecorators(
        ApiParam(REPORT_ID_PARAM),
        ApiEndpoint({
            summary: '커뮤니티 신고 기각',
            description: `
                신고를 기각(dismissed) 처리합니다. 게시글은 그대로 노출을 유지합니다.
            `,
            responseType: CommunityReportAdminActionResponseDto,
            successDescription: '신고 기각 성공',
            successMessageExample: COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES.reportDismissed,
            errorResponses: [
                {
                    status: 400,
                    description: '신고 없음 또는 이미 처리됨',
                    errorExample: COMMUNITY_REPORT_ADMIN_RESPONSE_MESSAGES.reportAlreadyHandled,
                },
            ],
        }),
    );
}
