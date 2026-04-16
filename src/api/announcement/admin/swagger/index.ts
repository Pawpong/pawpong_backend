import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { ApiController } from '../../../../common/decorator/swagger.decorator';
import { PageInfoDto } from '../../../../common/dto/pagination/page-info.dto';
import { ANNOUNCEMENT_ADMIN_ERROR_RESPONSES } from '../constants/announcement-admin-swagger.constants';
import { AnnouncementCreateRequestDto } from '../../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../../dto/request/announcement-update-request.dto';
import { AnnouncementResponseDto } from '../../dto/response/announcement-response.dto';

export function ApiAnnouncementAdminController() {
    return ApiController('공지사항 관리');
}

export function ApiGetAllAnnouncementsAdminEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: '공지사항 목록 조회 (관리자)',
            description: `
                모든 공지사항 목록을 조회합니다.

                ## 주요 기능
                - 비활성화된 공지사항도 포함해 조회합니다.
                - 페이지네이션을 지원합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'pageSize', required: false, type: Number, description: '페이지 크기', example: 10 }),
        ApiExtraModels(PageInfoDto, AnnouncementResponseDto),
        ApiResponse({
            status: 200,
            description: '공지사항 목록 조회 성공',
            schema: {
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
        }),
        ...ANNOUNCEMENT_ADMIN_ERROR_RESPONSES.map((response) =>
            ApiResponse({ status: response.status, description: response.description }),
        ),
    );
}

export function ApiCreateAnnouncementAdminEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: '공지사항 생성',
            description: `
                새로운 공지사항을 생성합니다.

                ## 주요 기능
                - 팝업/배너 타입 공지사항을 생성할 수 있습니다.
                - 생성 즉시 관리자 응답 DTO 형태로 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
        }),
        ApiBody({ type: AnnouncementCreateRequestDto }),
        ApiResponse({
            status: 200,
            description: '공지사항 생성 성공',
            type: AnnouncementResponseDto,
        }),
        ...ANNOUNCEMENT_ADMIN_ERROR_RESPONSES.map((response) =>
            ApiResponse({ status: response.status, description: response.description }),
        ),
    );
}

export function ApiUpdateAnnouncementAdminEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: '공지사항 수정',
            description: `
                기존 공지사항을 수정합니다.

                ## 주요 기능
                - 제목, 내용, 노출 기간, 활성 여부를 수정할 수 있습니다.
                - 잘못된 ID이거나 존재하지 않는 공지사항이면 예외를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
        }),
        ApiParam({
            name: 'announcementId',
            description: '수정할 공지사항 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: AnnouncementUpdateRequestDto }),
        ApiResponse({
            status: 200,
            description: '공지사항 수정 성공',
            type: AnnouncementResponseDto,
        }),
        ...ANNOUNCEMENT_ADMIN_ERROR_RESPONSES.map((response) =>
            ApiResponse({ status: response.status, description: response.description }),
        ),
    );
}

export function ApiDeleteAnnouncementAdminEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: '공지사항 삭제',
            description: `
                공지사항을 삭제합니다.

                ## 주의사항
                - 삭제된 공지사항은 복구할 수 없습니다.
                - 잘못된 ID이거나 존재하지 않는 공지사항이면 예외를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
        }),
        ApiParam({
            name: 'announcementId',
            description: '삭제할 공지사항 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiResponse({
            status: 200,
            description: '공지사항 삭제 성공',
        }),
        ...ANNOUNCEMENT_ADMIN_ERROR_RESPONSES.map((response) =>
            ApiResponse({ status: response.status, description: response.description }),
        ),
    );
}
