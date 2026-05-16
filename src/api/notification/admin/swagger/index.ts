import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notification-response-messages';
import { NOTIFICATION_ADMIN_FORBIDDEN_RESPONSE } from '../../constants/notification-swagger.constants';
import { AdminPushResultResponseDto } from '../dto/response/admin-push-result.dto';
import {
    NotificationAdminResponseDto,
    NotificationStatsResponseDto,
} from '../dto/response/notification-admin-response.dto';

export function ApiNotificationAdminController() {
    return ApiController('알림 관리 (Admin)');
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
            successMessageExample: NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed,
            errorResponses: [NOTIFICATION_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({
            name: 'userId',
            required: false,
            type: String,
            description: '사용자 ID 필터',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiQuery({
            name: 'userRole',
            required: false,
            enum: ['adopter', 'breeder'],
            description: '사용자 역할 필터',
            example: 'breeder',
        }),
        ApiQuery({
            name: 'type',
            required: false,
            type: String,
            description: '알림 타입 필터',
            example: 'NEW_CONSULT_REQUEST',
        }),
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
        successMessageExample: NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationStatsRetrieved,
        errorResponses: [NOTIFICATION_ADMIN_FORBIDDEN_RESPONSE],
    });
}

const ADMIN_PUSH_VALIDATION_ERROR = {
    status: 400,
    description: '입력 검증 실패 (target/title/body)',
    errorExample: '개별 발송은 userId가 필요합니다.',
} as const;

export function ApiSendAdminPushEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '어드민 푸시 발송',
            description: `
                관리자가 사용자에게 직접 푸시를 발송합니다. FCM 전송 + in-app 알림 doc 동시 생성.

                ## 대상 (target)
                - all_adopters: 활성 입양자 전체
                - all_breeders: 활성 브리더 전체
                - individual: { role, userId } 필수, 단일 사용자

                ## 동작
                - 활성 + 토큰 보유 사용자만 FCM 발송, 토큰 없는 사용자도 in-app 알림에는 저장
                - FCM 500 토큰 chunk 로 분할 멀티캐스트
                - invalidTokens 는 응답에 포함만 (정리는 후속 cleanup 작업 영역)

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: AdminPushResultResponseDto,
            successDescription: '어드민 푸시 발송 완료',
            successMessageExample: '어드민 푸시 발송이 완료되었습니다.',
            errorResponses: [ADMIN_PUSH_VALIDATION_ERROR, NOTIFICATION_ADMIN_FORBIDDEN_RESPONSE],
        }),
    );
}
