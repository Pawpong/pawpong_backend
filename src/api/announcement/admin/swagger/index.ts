import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiRawEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PageInfoDto } from '../../../../common/dto/pagination/page-info.dto';
import {
    ANNOUNCEMENT_ADMIN_FORBIDDEN_RESPONSE,
    ANNOUNCEMENT_ADMIN_NOT_FOUND_RESPONSE,
} from '../constants/announcement-admin-swagger.constants';
import { ANNOUNCEMENT_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/announcement-admin-response-messages';
import { AnnouncementCreateRequestDto } from '../../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../../dto/request/announcement-update-request.dto';
import { AnnouncementResponseDto } from '../../dto/response/announcement-response.dto';

export function ApiAnnouncementAdminController() {
    return ApiController('공지사항 관리');
}

export function ApiGetAllAnnouncementsAdminEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '공지사항 목록 조회 (관리자)',
            description: `
                모든 공지사항 목록을 조회합니다.

                ## 주요 기능
                - 비활성화된 공지사항도 포함해 조회합니다.
                - 페이지네이션을 지원합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            successDescription: '공지사항 목록 조회 성공',
            responseSchema: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        items: { $ref: getSchemaPath(AnnouncementResponseDto) },
                    },
                    pagination: {
                        $ref: getSchemaPath(PageInfoDto),
                    },
                },
                required: ['items', 'pagination'],
            },
            additionalModels: [AnnouncementResponseDto, PageInfoDto],
            errorResponses: [ANNOUNCEMENT_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'pageSize', required: false, type: Number, description: '페이지 크기', example: 10 }),
    );
}

export function ApiCreateAnnouncementAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '공지사항 생성',
            description: `
                새로운 공지사항을 생성합니다.

                ## 주요 기능
                - 팝업/배너 타입 공지사항을 생성할 수 있습니다.
                - 생성 즉시 관리자 응답 DTO 형태로 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: AnnouncementResponseDto,
            successDescription: '공지사항 생성 성공',
            successMessageExample: ANNOUNCEMENT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.announcementCreated,
            errorResponses: [ANNOUNCEMENT_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiBody({ type: AnnouncementCreateRequestDto }),
    );
}

export function ApiUpdateAnnouncementAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '공지사항 수정',
            description: `
                기존 공지사항을 수정합니다.

                ## 수정 가능 필드
                - title: 제목
                - content: 내용
                - isActive: 활성 여부
                - startAt: 노출 시작일
                - endAt: 노출 종료일

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: AnnouncementResponseDto,
            successDescription: '공지사항 수정 성공',
            successMessageExample: ANNOUNCEMENT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.announcementUpdated,
            errorResponses: [ANNOUNCEMENT_ADMIN_FORBIDDEN_RESPONSE, ANNOUNCEMENT_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'announcementId',
            description: '수정할 공지사항 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: AnnouncementUpdateRequestDto }),
    );
}

export function ApiDeleteAnnouncementAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '공지사항 삭제',
            description: `
                공지사항을 삭제합니다.

                ## 주의사항
                - 삭제된 공지사항은 복구할 수 없습니다.
                - 존재하지 않는 공지사항이면 404 예외를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            nullableData: true,
            successDescription: '공지사항 삭제 성공',
            successMessageExample: ANNOUNCEMENT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.announcementDeleted,
            errorResponses: [ANNOUNCEMENT_ADMIN_FORBIDDEN_RESPONSE, ANNOUNCEMENT_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'announcementId',
            description: '삭제할 공지사항 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
