import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger';

import { ApiPublicController, ApiRawEndpoint } from '../../../common/decorator/swagger.decorator';
import { PageInfoDto } from '../../../common/dto/pagination/page-info.dto';
import { ANNOUNCEMENT_NOT_FOUND_RESPONSE } from '../constants/announcement-swagger.constants';
import { AnnouncementResponseDto } from '../dto/response/announcement-response.dto';

export function ApiAnnouncementController() {
    return ApiPublicController('공지사항');
}

export function ApiGetActiveAnnouncementsEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '공지사항 목록 조회',
            description: `
                활성화된 공지사항 목록을 페이지네이션으로 조회합니다.

                ## 주요 기능
                - 인증 없이 호출할 수 있습니다.
                - 활성화된 공지사항만 노출합니다.
                - page와 pageSize 기준으로 페이지 정보를 함께 반환합니다.
            `,
            isPublic: true,
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
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'pageSize', required: false, type: Number, description: '페이지 크기', example: 10 }),
    );
}

export function ApiGetAnnouncementByIdEndpoint() {
    return applyDecorators(
        ApiRawEndpoint({
            summary: '공지사항 상세 조회',
            description: `
                특정 공지사항의 상세 정보를 조회합니다.

                ## 주요 기능
                - 인증 없이 호출할 수 있습니다.
                - 활성화된 공지사항만 상세 조회할 수 있습니다.
            `,
            responseType: AnnouncementResponseDto,
            isPublic: true,
            successDescription: '공지사항 조회 성공',
            errorResponses: [ANNOUNCEMENT_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'announcementId',
            description: '공지사항 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
