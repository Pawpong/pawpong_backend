import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notice-response-messages';
import {
    NOTICE_ADMIN_FORBIDDEN_RESPONSE,
    NOTICE_ADMIN_NOT_FOUND_RESPONSE,
    NOTICE_ADMIN_STATUS_VALUES,
} from '../../constants/notice-swagger.constants';
import { NoticeResponseDto } from '../../dto/response/notice-response.dto';

export function ApiNoticeAdminController() {
    return ApiController('공지사항 관리 (관리자)');
}

export function ApiCreateNoticeAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '공지사항 생성',
            description: `
                새로운 공지사항을 생성합니다.

                ## 주요 기능
                - 현재 인증된 관리자 정보를 작성자로 기록합니다.
                - published, draft, archived 상태로 저장할 수 있습니다.
                - 상단 고정 여부와 게시 시작/종료일을 함께 설정할 수 있습니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: NoticeResponseDto,
            successDescription: '공지사항 생성 성공',
            successMessageExample: NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeCreated,
            errorResponses: [NOTICE_ADMIN_FORBIDDEN_RESPONSE],
        }),
    );
}

export function ApiGetNoticeListAdminEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '공지사항 목록 조회 (관리자)',
            description: `
                공지사항을 페이지네이션으로 조회합니다.

                ## 주요 기능
                - published, draft, archived 상태를 모두 조회할 수 있습니다.
                - status 쿼리로 특정 상태만 필터링할 수 있습니다.
                - page, limit, pageSize 쿼리를 모두 지원합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: PaginationResponseDto,
            itemType: NoticeResponseDto,
            successDescription: '공지사항 목록 조회 성공',
            successMessageExample: NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeListRetrieved,
            errorResponses: [NOTICE_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지 크기 (기본값 10, 최대 100)', example: 10 }),
        ApiQuery({
            name: 'pageSize',
            required: false,
            type: Number,
            description: 'limit의 별칭입니다. 프론트엔드 호환용으로 동일하게 동작합니다.',
            example: 10,
        }),
        ApiQuery({
            name: 'status',
            required: false,
            enum: NOTICE_ADMIN_STATUS_VALUES,
            description: '공지사항 상태 필터',
            example: 'published',
        }),
    );
}

export function ApiGetNoticeDetailAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '공지사항 상세 조회 (관리자)',
            description: `
                특정 공지사항의 상세 정보를 조회합니다.

                ## 주요 기능
                - 관리자 조회이므로 조회수는 증가하지 않습니다.
                - draft 또는 archived 상태 공지도 조회할 수 있습니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: NoticeResponseDto,
            successDescription: '공지사항 조회 성공',
            successMessageExample: NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDetailRetrieved,
            errorResponses: [NOTICE_ADMIN_FORBIDDEN_RESPONSE, NOTICE_ADMIN_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiUpdateNoticeAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '공지사항 수정',
            description: `
                기존 공지사항을 수정합니다.

                ## 수정 가능 필드
                - title
                - content
                - status
                - isPinned
                - publishedAt
                - expiredAt

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: NoticeResponseDto,
            successDescription: '공지사항 수정 성공',
            successMessageExample: NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeUpdated,
            errorResponses: [NOTICE_ADMIN_FORBIDDEN_RESPONSE, NOTICE_ADMIN_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiDeleteNoticeAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '공지사항 삭제',
            description: `
                공지사항을 삭제합니다.

                ## 주의사항
                - 삭제된 공지사항은 복구할 수 없습니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            successDescription: '공지사항 삭제 성공',
            successMessageExample: NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDeleted,
            nullableData: true,
            errorResponses: [NOTICE_ADMIN_FORBIDDEN_RESPONSE, NOTICE_ADMIN_NOT_FOUND_RESPONSE],
        }),
    );
}
