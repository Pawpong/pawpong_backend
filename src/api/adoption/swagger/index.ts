import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

import {
    ApiController,
    ApiEndpoint,
    ApiPaginatedEndpoint,
    ApiPublicController,
} from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ADOPTION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/adoption-response-messages';
import { AdoptedPetCardResponseDto } from '../dto/response/adopted-pet-card.dto';
import { AdoptionPetDetailResponseDto } from '../dto/response/adoption-pet-detail-response.dto';
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
                카테고리탭(Figma 6:131) — petType 필터로 동물 종류별 노출.
                상세 화면(Figma 39:1240) — breederId + excludePetId 조합으로 "브리더의 다른 분양 동물" 영역 조회.

                ## 주요 기능
                - petType 필터 (강아지/고양이/도마뱀)
                - breederId 필터 (특정 브리더의 분양 동물만)
                - excludePetId (특정 펫을 결과에서 제외 — 상세 화면 자기 자신 제외용)
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
        ApiQuery({ name: 'breederId', required: false, type: String, description: '특정 브리더 필터 (ObjectId)' }),
        ApiQuery({ name: 'excludePetId', required: false, type: String, description: '결과에서 제외할 펫 ID' }),
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

export function ApiGetAdoptionDetailEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '입양 동물 상세 조회 (Figma 39:1240)',
            description: `
                입양 상세 화면에 필요한 모든 정보를 한 번에 반환합니다.

                ## 동작
                - 상세 진입 시 viewCount 가 +1 증가합니다 (isActive=true 도큐먼트만 대상).
                - 비활성 또는 미존재 펫은 400 으로 응답합니다.

                ## 응답 구성
                - 카드 필드 (이름/품종/가격/상태/사진/카운트 등)
                - 건강 정보 (예방 접종 기록, 유전병 검사 기록 — 미완료시 사유)
                - 부모 정보 스냅샷 (관계/품종/이름/생년/사진)
                - 사육 환경 (설명 + 사진)
                - 브리더 요약 (닉네임/프로필이미지/위치/BPM)
                - 인증 사용자는 isFavorited 채워집니다.
            `,
            responseType: AdoptionPetDetailResponseDto,
            isPublic: true,
            supportsOptionalAuth: true,
            successDescription: '입양 동물 상세 조회 성공',
            successMessageExample: ADOPTION_RESPONSE_MESSAGE_EXAMPLES.detailRetrieved,
            errorResponses: [PET_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'petId', description: '동물 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiAddAdoptionFavoriteEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '동물 관심 등록',
            description:
                '입양 가능 동물을 입양자 즐겨찾기에 추가합니다. 이미 등록된 경우에도 200 으로 처리됩니다 (idempotent).',
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
            description:
                '입양자 즐겨찾기에서 동물을 제거합니다. 등록되어 있지 않아도 200 으로 처리됩니다 (idempotent).',
            responseType: AdoptionFavoriteResponseDto,
            successDescription: '관심 해제 성공',
            successMessageExample: ADOPTION_RESPONSE_MESSAGE_EXAMPLES.favoriteRemoved,
            errorResponses: [PET_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'petId', description: '동물 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiGetMyAdoptionFavoritesEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '입양 관심 목록 (저장 목록 탭)',
            description: `
                입양자 본인이 즐겨찾기한 분양 펫 목록을 추가 시각 desc 로 페이지네이션합니다.

                ## 필터
                - status (선택): available / reserved / adopted — 미지정 시 전체

                ## 응답 특이사항
                - 본 목록의 모든 카드는 정의상 즐겨찾기 등록 상태 — isFavorited=true 고정
            `,
            responseType: PaginationResponseDto,
            itemType: AdoptionPetResponseDto,
            successDescription: '입양 관심 목록 조회 성공',
            successMessageExample: ADOPTION_RESPONSE_MESSAGE_EXAMPLES.myFavoritesRetrieved,
        }),
    );
}

export function ApiGetMyAdoptedListEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '내가 입양한 목록 (저장 목록 — 입양목록 탭)',
            description: `
                Figma 296:3286 — 입양자 본인이 입양 완료(adoption_approved)한 펫의 카드 페이지네이션.

                ## 데이터 출처
                - adoption_applications.status = 'adoption_approved' 인 신청을 펫과 join 후 입양 확정 시각 desc 정렬
                - 입양 확정 시각 = application.reviewedAt 우선, 없으면 appliedAt fallback

                ## 응답 특이사항
                - AdoptionPetResponseDto 에 adoptedAt(ISO 8601) 추가
                - 본인이 이미 입양한 펫이므로 isFavorited 는 false 로 고정 (UI 미사용 가정)
            `,
            responseType: PaginationResponseDto,
            itemType: AdoptedPetCardResponseDto,
            successDescription: '내가 입양한 목록 조회 성공',
            successMessageExample: ADOPTION_RESPONSE_MESSAGE_EXAMPLES.myAdoptedRetrieved,
        }),
    );
}
