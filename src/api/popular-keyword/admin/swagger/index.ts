import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/popular-keyword-admin-response-messages';
import { PopularKeywordResponseDto } from '../../dto/response/popular-keyword-response.dto';

const NOT_FOUND_RESPONSE = {
    status: 400,
    description: '인기 검색어를 찾을 수 없음',
    errorExample: '인기 검색어를 찾을 수 없습니다.',
} as const;

const CONFLICT_RESPONSE = {
    status: 409,
    description: '이미 등록된 키워드',
    errorExample: '이미 등록된 키워드입니다.',
} as const;

export function ApiPopularKeywordAdminController() {
    return ApiController('인기 검색어 관리');
}

export function ApiGetAllPopularKeywordsAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '전체 인기 검색어 조회 (관리자)',
            description: '활성/비활성 모두 포함한 전체 인기 검색어 목록을 반환합니다.',
            responseType: [PopularKeywordResponseDto],
            successDescription: '인기 검색어 목록 조회 성공',
            successMessageExample: POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordsListRetrieved,
        }),
    );
}

export function ApiGetPopularKeywordByIdAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '인기 검색어 단건 조회 (관리자)',
            responseType: PopularKeywordResponseDto,
            successDescription: '인기 검색어 조회 성공',
            successMessageExample: POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordRetrieved,
            errorResponses: [NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'id', description: '인기 검색어 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiCreatePopularKeywordAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '인기 검색어 생성 (관리자)',
            responseType: PopularKeywordResponseDto,
            successDescription: '인기 검색어 생성 성공',
            successMessageExample: POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordCreated,
            errorResponses: [CONFLICT_RESPONSE],
        }),
    );
}

export function ApiUpdatePopularKeywordAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '인기 검색어 수정 (관리자)',
            responseType: PopularKeywordResponseDto,
            successDescription: '인기 검색어 수정 성공',
            successMessageExample: POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordUpdated,
            errorResponses: [NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'id', description: '인기 검색어 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiDeletePopularKeywordAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '인기 검색어 삭제 (관리자)',
            successDescription: '인기 검색어 삭제 성공',
            successMessageExample: POPULAR_KEYWORD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.popularKeywordDeleted,
            errorResponses: [NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'id', description: '인기 검색어 ID', example: '507f1f77bcf86cd799439011' }),
    );
}
