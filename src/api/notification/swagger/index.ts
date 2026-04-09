import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';
import { NOTIFICATION_NOT_FOUND_RESPONSE } from '../constants/notification-swagger.constants';
import {
    MarkAllAsReadResponseDto,
    MarkAsReadResponseDto,
    NotificationResponseDto,
    UnreadCountResponseDto,
} from '../dto/response/notification-response.dto';

export function ApiNotificationController() {
    return ApiController('알림');
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
    return ApiEndpoint({
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
    });
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

export function ApiDeleteNotificationEndpoint() {
    return ApiEndpoint({
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
    });
}
