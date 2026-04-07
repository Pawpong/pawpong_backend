import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import {
    NotificationAdminResponseDto,
    NotificationStatsResponseDto,
} from '../dto/response/notification-admin-response.dto';

const NOTIFICATION_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
};

export function ApiNotificationAdminController() {
    return ApiController('관리자 알림 관리');
}

export function ApiGetAdminNotificationsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '알림 목록 조회 (관리자)',
            description: `
                관리자가 모든 사용자의 알림을 페이지네이션 형태로 조회합니다.

                ## 주요 기능
                - userId, userRole, type, isRead 필터를 지원합니다.
                - 페이지 번호와 페이지당 항목 수를 조정할 수 있습니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: PaginationResponseDto,
            itemType: NotificationAdminResponseDto,
            successDescription: '알림 목록 조회 성공',
            successMessageExample: '알림 목록이 조회되었습니다.',
            errorResponses: [NOTIFICATION_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({ name: 'userId', required: false, type: String, description: '사용자 ID 필터', example: '507f1f77bcf86cd799439011' }),
        ApiQuery({ name: 'userRole', required: false, enum: ['adopter', 'breeder'], description: '사용자 역할 필터', example: 'breeder' }),
        ApiQuery({ name: 'type', required: false, type: String, description: '알림 타입 필터', example: 'NEW_CONSULT_REQUEST' }),
        ApiQuery({ name: 'isRead', required: false, type: Boolean, description: '읽음 여부 필터', example: false }),
        ApiQuery({ name: 'pageNumber', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'itemsPerPage', required: false, type: Number, description: '페이지당 항목 수', example: 20 }),
    );
}

export function ApiGetNotificationAdminStatsEndpoint() {
    return ApiEndpoint({
        summary: '알림 통계 조회 (관리자)',
        description: `
            관리자가 서비스 전체 알림 통계를 조회합니다.

            ## 주요 기능
            - 전체 알림 수와 읽지 않은 알림 수를 제공합니다.
            - 타입별, 역할별 알림 집계 결과를 반환합니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        responseType: NotificationStatsResponseDto,
        successDescription: '알림 통계 조회 성공',
        successMessageExample: '알림 통계가 조회되었습니다.',
        errorResponses: [NOTIFICATION_ADMIN_FORBIDDEN_RESPONSE],
    });
}
