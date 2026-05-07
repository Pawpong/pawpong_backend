import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import {
    ApiController,
    ApiEndpoint,
    ApiPaginatedEndpoint,
    ApiPublicController,
} from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ADOPTION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/adoption-response-messages';
import { AdoptionFavoriteResponseDto, AdoptionPetResponseDto } from '../dto/response/adoption-pet-response.dto';

const PET_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '동물을 찾을 수 없음',
    errorExample: '해당 동물을 찾을 수 없습니다.',
} as const;

export function ApiAdoptionPublicController() {
    return ApiPublicController('입양');
}

export function ApiAdoptionProtectedController() {
    return ApiController('입양 (인증)');
}

export function ApiGetAdoptionListEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '입양 가능 동물 목록 조회',
            description: `
                입양 페이지의 "전체 입양 소식" 목록을 페이지네이션으로 반환합니다.

                ## 주요 기능
                - petType 필터 (강아지/고양이/도마뱀)
                - 정렬: 최신순(latest) / 인기순(popular)
                - 인증 사용자는 카드별 isFavorited 가 채워집니다
            `,
            responseType: PaginationResponseDto,
            itemType: AdoptionPetResponseDto,
            isPublic: true,
            supportsOptionalAuth: true,
            successDescription: '입양 동물 목록 조회 성공',
            successMessageExample: ADOPTION_RESPONSE_MESSAGE_EXAMPLES.listRetrieved,
        }),
    );
}

export function ApiGetPopularAdoptionEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '인기 입양 동물 조회',
            description: `
                입양 페이지 상단 "인기 있는 동물들" 영역에 노출되는 카드를 반환합니다.

                ## 정렬
                favoriteCount > viewCount > createdAt 우선순위로 정렬되며 입양 가능 상태(available)만 포함됩니다.
            `,
            responseType: [AdoptionPetResponseDto],
            isPublic: true,
            supportsOptionalAuth: true,
            successDescription: '인기 입양 동물 조회 성공',
            successMessageExample: ADOPTION_RESPONSE_MESSAGE_EXAMPLES.popularRetrieved,
        }),
    );
}

export function ApiAddAdoptionFavoriteEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '동물 관심 등록',
            description: '입양 가능 동물을 입양자 즐겨찾기에 추가합니다. 이미 등록된 경우에도 200 으로 처리됩니다 (idempotent).',
            responseType: AdoptionFavoriteResponseDto,
            successDescription: '관심 등록 성공',
            successMessageExample: ADOPTION_RESPONSE_MESSAGE_EXAMPLES.favoriteAdded,
            errorResponses: [PET_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'petId', description: '동물 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiRemoveAdoptionFavoriteEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '동물 관심 해제',
            description: '입양자 즐겨찾기에서 동물을 제거합니다. 등록되어 있지 않아도 200 으로 처리됩니다 (idempotent).',
            responseType: AdoptionFavoriteResponseDto,
            successDescription: '관심 해제 성공',
            successMessageExample: ADOPTION_RESPONSE_MESSAGE_EXAMPLES.favoriteRemoved,
            errorResponses: [PET_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'petId', description: '동물 ID', example: '507f1f77bcf86cd799439011' }),
    );
}
