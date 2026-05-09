import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import {
    ApiController,
    ApiEndpoint,
    ApiPaginatedEndpoint,
    ApiPublicController,
} from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { PROFILE_RESPONSE_MESSAGES } from '../constants/profile-response-messages';
import { AdopterPublicProfileResponseDto } from '../dto/response/adopter-profile-response.dto';
import { BreederPublicProfileResponseDto } from '../dto/response/breeder-profile-response.dto';
import { FavoriteBreederCardResponseDto } from '../dto/response/favorite-breeder-card.dto';
import { MyProfileResponseDto } from '../dto/response/my-profile-response.dto';

const NOT_FOUND_RESPONSE = {
    status: 400,
    description: '프로필 정보를 찾을 수 없음',
    errorExample: '입양자 정보를 찾을 수 없습니다.',
} as const;

export function ApiProfileProtectedController() {
    return ApiController('프로필 (v2)');
}

export function ApiProfilePublicController() {
    return ApiPublicController('프로필 (v2 공개)');
}

export function ApiGetMyProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '내 프로필 조회 (마이홈)',
            description: '현재 인증된 사용자의 프로필을 반환한다. role 에 따라 입양자/브리더 응답 필드가 다르다.',
            responseType: MyProfileResponseDto,
            successDescription: '내 프로필 조회 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.myRetrieved,
            errorResponses: [NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiGetAdopterProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '다른 입양자 프로필 조회 (유저홈)',
            description: '특정 입양자의 공개 프로필. follow 시스템 미구현이라 isFollowing 은 항상 false.',
            responseType: AdopterPublicProfileResponseDto,
            isPublic: true,
            supportsOptionalAuth: true,
            successDescription: '입양자 프로필 조회 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.adopterRetrieved,
            errorResponses: [NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'userId', description: '입양자 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiGetBreederProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 공개 프로필 조회 (브리더홈)',
            description: '브리더의 공개 프로필. 로그인 입양자는 isFavorited 가 채워진다.',
            responseType: BreederPublicProfileResponseDto,
            isPublic: true,
            supportsOptionalAuth: true,
            successDescription: '브리더 프로필 조회 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.breederRetrieved,
            errorResponses: [{ ...NOT_FOUND_RESPONSE, errorExample: '브리더 정보를 찾을 수 없습니다.' }],
        }),
        ApiParam({ name: 'breederId', description: '브리더 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiGetMyFavoriteBreedersEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '마이홈 즐겨찾는 브리더 목록',
            description: '현재 입양자가 즐겨찾기한 브리더 카드 페이지네이션. 추가일 최신순으로 정렬.',
            responseType: PaginationResponseDto,
            itemType: FavoriteBreederCardResponseDto,
            successDescription: '즐겨찾는 브리더 목록 조회 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.favoriteBreedersRetrieved,
        }),
    );
}
