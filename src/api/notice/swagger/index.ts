import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

import { ApiEndpoint, ApiPaginatedEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notice-response-messages';
import { NOTICE_NOT_FOUND_RESPONSE } from '../constants/notice-swagger.constants';
import { NoticeResponseDto } from '../dto/response/notice-response.dto';

export function ApiNoticeController() {
    return ApiPublicController('공지사항');
}

export function ApiGetNoticeListEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '공지사항 목록 조회',
            description: `
                게시된 공지사항 목록을 페이지네이션으로 조회합니다.

                ## 주요 기능
                - published 상태의 공지만 공개 노출합니다.
                - pageSize를 생략하면 기본 페이지 크기로 조회합니다.
            `,
            responseType: PaginationResponseDto,
            itemType: NoticeResponseDto,
            isPublic: true,
            successDescription: '공지사항 목록 조회 성공',
            successMessageExample: NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeListRetrieved,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'pageSize', required: false, type: Number, description: '페이지 크기', example: 10 }),
    );
}

export function ApiGetNoticeDetailEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '공지사항 상세 조회',
            description: `
                특정 공지사항의 상세 정보를 조회합니다.

                ## 주요 기능
                - 상세 조회 시 조회수가 증가합니다.
                - 게시 종료되었거나 존재하지 않는 공지는 조회할 수 없습니다.
            `,
            responseType: NoticeResponseDto,
            isPublic: true,
            successDescription: '공지사항 조회 성공',
            successMessageExample: NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDetailRetrieved,
            errorResponses: [NOTICE_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'noticeId',
            description: '공지사항 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
