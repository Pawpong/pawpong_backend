import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiProduces, ApiQuery } from '@nestjs/swagger';

import {
    ApiController,
    ApiEndpoint,
    ApiPaginatedEndpoint,
    ApiRawEndpoint,
} from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import {
    NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES,
    NOTIFICATION_EMAIL_PREVIEW_TYPES,
} from '../constants/notification-email-preview.constants';
import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';
import { NOTIFICATION_NOT_FOUND_RESPONSE } from '../constants/notification-swagger.constants';
import {
    ApplicationConfirmationEmailPreviewRequestDto,
    BreederApprovalEmailPreviewRequestDto,
    BreederRejectionEmailPreviewRequestDto,
    DocumentReminderEmailPreviewRequestDto,
    NewApplicationEmailPreviewRequestDto,
    NewReviewEmailPreviewRequestDto,
} from '../dto/request/notification-email-preview-request.dto';
import { RegisterPushDeviceTokenRequestDto } from '../dto/request/register-push-device-token-request.dto';
import { UnregisterPushDeviceTokenRequestDto } from '../dto/request/unregister-push-device-token-request.dto';
import {
    NotificationEmailPreviewCatalogResponseDto,
    NotificationEmailPreviewResponseDto,
} from '../dto/response/notification-email-preview-response.dto';
import {
    MarkAllAsReadResponseDto,
    MarkAsReadResponseDto,
    NotificationResponseDto,
    UnreadCountResponseDto,
} from '../dto/response/notification-response.dto';

export function ApiNotificationController() {
    return ApiController('알림');
}

export function ApiNotificationEmailPreviewAdminController() {
    return ApiController('알림 이메일 프리뷰 (Admin)');
}

export function ApiGetNotificationsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '알림 목록 조회',
            description: `
                로그인한 사용자의 알림 목록을 페이지네이션으로 조회합니다.

                ## 주요 기능
                - 읽음 여부로 필터링할 수 있습니다.
                - 최신 알림 순으로 목록과 메타 정보를 반환합니다.
            `,
            responseType: PaginationResponseDto,
            itemType: NotificationResponseDto,
            successDescription: '알림 목록 조회 성공',
            successMessageExample: NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수', example: 20 }),
        ApiQuery({ name: 'isRead', required: false, type: Boolean, description: '읽음 여부 필터', example: false }),
    );
}

export function ApiGetUnreadNotificationCountEndpoint() {
    return ApiEndpoint({
        summary: '읽지 않은 알림 수 조회',
        description: `
            로그인한 사용자의 읽지 않은 알림 수를 조회합니다.

            ## 주요 기능
            - 읽지 않은 알림 개수만 빠르게 확인할 수 있습니다.
            - 앱 배지 카운트 계산에 사용할 수 있습니다.
        `,
        responseType: UnreadCountResponseDto,
        successDescription: '읽지 않은 알림 수 조회 성공',
        successMessageExample: NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.unreadCountRetrieved,
    });
}

export function ApiMarkNotificationReadEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '알림 읽음 처리',
            description: `
                특정 알림을 읽음 상태로 변경합니다.

                ## 주요 기능
                - 본인 소유 알림만 읽음 처리할 수 있습니다.
                - 이미 읽은 알림도 동일한 계약으로 응답합니다.
            `,
            responseType: MarkAsReadResponseDto,
            successDescription: '알림 읽음 처리 성공',
            successMessageExample: NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationMarkedRead,
            errorResponses: [NOTIFICATION_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '읽음 처리할 알림 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

export function ApiMarkAllNotificationsReadEndpoint() {
    return ApiEndpoint({
        summary: '모든 알림 읽음 처리',
        description: `
            로그인한 사용자의 읽지 않은 알림을 모두 읽음 상태로 변경합니다.

            ## 주요 기능
            - 이번 요청으로 변경된 알림 개수를 반환합니다.
            - 읽지 않은 알림이 없어도 동일한 계약으로 응답합니다.
        `,
        responseType: MarkAllAsReadResponseDto,
        successDescription: '모든 알림 읽음 처리 성공',
        successMessageExample: NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.allNotificationsMarkedRead,
    });
}

export function ApiRegisterPushDeviceTokenEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '디바이스 푸시 토큰 등록',
            description: `
                RN 앱에서 발급받은 FCM 디바이스 토큰을 현재 로그인한 사용자 계정에 등록합니다.

                ## 주요 기능
                - 같은 토큰이 이미 등록되어 있으면 등록 시각만 갱신합니다.
                - 한 사용자는 여러 디바이스(iOS/Android)를 동시에 등록할 수 있습니다.
            `,
            nullableData: true,
            successDescription: '푸시 토큰 등록 성공',
            successMessageExample: NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.pushDeviceTokenRegistered,
        }),
        ApiBody({ type: RegisterPushDeviceTokenRequestDto }),
    );
}

export function ApiUnregisterPushDeviceTokenEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '디바이스 푸시 토큰 해제',
            description: `
                지정한 디바이스 토큰을 사용자 계정에서 제거합니다.
                토큰은 body로 전달해 HTTP 접근 로그에 노출되지 않습니다.

                ## 주요 기능
                - 로그아웃, 알림 거부, 앱 삭제 전에 호출해 잔여 토큰을 정리합니다.
                - 등록되지 않은 토큰을 요청해도 성공 응답(멱등) 합니다.
            `,
            nullableData: true,
            successDescription: '푸시 토큰 해제 성공',
            successMessageExample: NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.pushDeviceTokenUnregistered,
        }),
        ApiBody({ type: UnregisterPushDeviceTokenRequestDto }),
    );
}

export function ApiDeleteNotificationEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '알림 삭제',
            description: `
                특정 알림을 삭제합니다.

                ## 주요 기능
                - 본인 소유 알림만 삭제할 수 있습니다.
                - 성공 시 data는 null로 반환합니다.
            `,
            nullableData: true,
            successDescription: '알림 삭제 성공',
            successMessageExample: NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationDeleted,
            errorResponses: [NOTIFICATION_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '삭제할 알림 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

function buildNotificationEmailPreviewEndpoint(summary: string, description: string, successMessageExample: string) {
    return ApiEndpoint({
        summary,
        description,
        responseType: NotificationEmailPreviewResponseDto,
        successDescription: '이메일 프리뷰 발송 성공',
        successMessageExample,
        errorResponses: [{ status: 403, description: '권한 없음', errorExample: '관리자 권한이 필요합니다.' }],
    });
}

export function ApiPreviewBreederApprovalEmailEndpoint() {
    return applyDecorators(
        buildNotificationEmailPreviewEndpoint(
            '브리더 승인 이메일 테스트',
            '브리더 입점 승인 이메일 템플릿을 테스트 발송합니다.',
            NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.breederApprovalSent,
        ),
        ApiBody({ type: BreederApprovalEmailPreviewRequestDto }),
    );
}

export function ApiPreviewBreederRejectionEmailEndpoint() {
    return applyDecorators(
        buildNotificationEmailPreviewEndpoint(
            '브리더 반려 이메일 테스트',
            '브리더 입점 반려 이메일 템플릿을 테스트 발송합니다.',
            NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.breederRejectionSent,
        ),
        ApiBody({ type: BreederRejectionEmailPreviewRequestDto }),
    );
}

export function ApiPreviewNewApplicationEmailEndpoint() {
    return applyDecorators(
        buildNotificationEmailPreviewEndpoint(
            '새 상담 신청 알림 이메일 테스트',
            '브리더에게 새 입양 상담 신청이 왔을 때 발송되는 이메일을 테스트합니다.',
            NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.newApplicationSent,
        ),
        ApiBody({ type: NewApplicationEmailPreviewRequestDto }),
    );
}

export function ApiPreviewDocumentReminderEmailEndpoint() {
    return applyDecorators(
        buildNotificationEmailPreviewEndpoint(
            '서류 미제출 리마인드 이메일 테스트',
            '브리더 서류 미제출 리마인드 이메일을 테스트합니다.',
            NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.documentReminderSent,
        ),
        ApiBody({ type: DocumentReminderEmailPreviewRequestDto }),
    );
}

export function ApiPreviewApplicationConfirmationEmailEndpoint() {
    return applyDecorators(
        buildNotificationEmailPreviewEndpoint(
            '상담 신청 확인 이메일 테스트',
            '입양자가 상담 신청 후 받는 확인 이메일을 테스트합니다.',
            NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.applicationConfirmationSent,
        ),
        ApiBody({ type: ApplicationConfirmationEmailPreviewRequestDto }),
    );
}

export function ApiPreviewNewReviewEmailEndpoint() {
    return applyDecorators(
        buildNotificationEmailPreviewEndpoint(
            '신규 후기 이메일 테스트',
            '브리더에게 새 후기가 등록되었을 때 발송되는 이메일을 테스트합니다.',
            NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.newReviewSent,
        ),
        ApiBody({ type: NewReviewEmailPreviewRequestDto }),
    );
}

export function ApiGetNotificationEmailPreviewCatalogEndpoint() {
    return ApiEndpoint({
        summary: '모든 이메일 템플릿 미리보기',
        description: '모든 이메일 템플릿의 제목과 HTML을 반환합니다.',
        responseType: NotificationEmailPreviewCatalogResponseDto,
        successDescription: '이메일 프리뷰 목록 조회 성공',
        successMessageExample: NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES.previewCatalogRetrieved,
        errorResponses: [{ status: 403, description: '권한 없음', errorExample: '관리자 권한이 필요합니다.' }],
    });
}

export function ApiRenderNotificationEmailPreviewEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '이메일 HTML 렌더링 미리보기',
            description: '선택한 이메일 템플릿을 raw HTML로 렌더링합니다. type이 없으면 선택 화면을 반환합니다.',
            successDescription: '이메일 HTML 렌더링 성공',
            responseSchema: {
                type: 'string',
                example: '<html><body>...</body></html>',
            },
            errorResponses: [{ status: 403, description: '권한 없음', errorExample: '관리자 권한이 필요합니다.' }],
        }),
        ApiProduces('text/html'),
        ApiQuery({
            name: 'type',
            required: false,
            enum: NOTIFICATION_EMAIL_PREVIEW_TYPES,
            description: '렌더링할 이메일 템플릿 타입',
            example: 'breeder-approval',
        }),
    );
}
