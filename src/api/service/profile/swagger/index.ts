import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import {
    ApiController,
    ApiEndpoint,
    ApiPaginatedEndpoint,
    ApiPublicController,
} from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { PROFILE_RESPONSE_MESSAGES } from '../constants/profile-response-messages';
import { AdopterPublicProfileResponseDto } from '../dto/response/adopter-profile-response.dto';
import { BreederPublicProfileResponseDto } from '../dto/response/breeder-profile-response.dto';
import { FavoriteBreederCardResponseDto } from '../dto/response/favorite-breeder-card.dto';
import { FollowResponseDto, UnfollowResponseDto } from '../dto/response/follow-response.dto';
import { FollowUserCardResponseDto, RemoveFollowerResponseDto } from '../dto/response/follow-user-card.dto';
import { MyProfileResponseDto } from '../dto/response/my-profile-response.dto';

const NOT_FOUND_RESPONSE = {
    status: 400,
    description: '프로필 정보를 찾을 수 없음',
    errorExample: '입양자 정보를 찾을 수 없습니다.',
} as const;

export function ApiProfileProtectedController() {
    return ApiController('프로필');
}

export function ApiProfilePublicController() {
    return ApiPublicController('프로필');
}

export function ApiGetMyProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '내 프로필 조회 (마이홈)',
            description: '현재 인증된 사용자의 프로필을 반환합니다. role 에 따라 입양자/브리더 응답 필드가 다릅니다.',
            responseType: MyProfileResponseDto,
            successDescription: '내 프로필 조회 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.myRetrieved,
            errorResponses: [NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiUpdateMyProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '내 프로필 수정 (마이홈, Figma 278:170 "프로필 편집")',
            description: `
                현재 인증된 사용자의 프로필을 부분 수정합니다. role 에 따라 Adopter/Breeder 도큐먼트에 적용.

                ## 지원 필드
                - bio (선택): 한 줄 소개. trim 후 200자 이내. 빈 문자열은 한 줄 소개 비움 의도.

                사업장 위치는 이 엔드포인트로 수정할 수 없습니다.
                PATCH /breeder-management/profile 이 해당 필드의 단독 쓰기 경로다 (locationInfo: cityName/districtName/detailAddress).
                응답의 businessLocation 은 읽기 전용으로만 노출됩니다.

                ## 응답
                - 수정 후 GetMyProfile 와 동일한 응답 (계약 일관성)
            `,
            responseType: MyProfileResponseDto,
            successDescription: '내 프로필 수정 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.myUpdated,
            errorResponses: [NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiGetAdopterProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '다른 입양자 프로필 조회 (유저홈)',
            description: '특정 입양자의 공개 프로필. 로그인 사용자는 isFollowing 이 실제 팔로우 여부로 채워진다.',
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
            description:
                '브리더의 공개 프로필. 로그인 입양자는 isFavorited 가, 로그인 사용자는 isFollowing 이 채워진다.',
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

export function ApiFollowUserEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '사용자 팔로우 (Figma 678:46565)',
            description: `
                유저홈·브리더홈에서 팔로우. 대상은 입양자(Adopter)·브리더(Breeder) 모두 가능.
                이미 팔로우 중이면 followed: false 반환 (멱등).
                자기 자신 팔로우 시 400.
            `,
            responseType: FollowResponseDto,
            successDescription: '팔로우 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.followed,
            errorResponses: [
                {
                    status: 400,
                    description: '대상 없음 / 자기 자신 팔로우',
                    errorExample: '해당 사용자를 찾을 수 없습니다.',
                },
            ],
        }),
        ApiParam({ name: 'userId', description: '팔로우할 사용자 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiUnfollowUserEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '사용자 팔로우 취소',
            description: '팔로우 중이 아닌 사용자에게 요청 시 unfollowed: false 반환 (멱등).',
            responseType: UnfollowResponseDto,
            successDescription: '팔로우 취소 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.unfollowed,
        }),
        ApiParam({ name: 'userId', description: '팔로우 취소할 사용자 ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiGetUserFollowersEndpoint() {
    return applyDecorators(
        ApiParam({ name: 'userId', description: '조회 대상 사용자 ID', example: '507f1f77bcf86cd799439011' }),
        ApiPaginatedEndpoint({
            summary: '팔로워 목록 (친구 목록 모달)',
            description: `
                대상 사용자를 팔로우하는 사용자 목록. 팔로우 최신순 정렬.
                로그인 상태면 각 항목의 isFollowing(내가 팔로우 중) / isFollowedBy(상대가 나를 팔로우 중)가 채워지며,
                둘 다 true 면 "맞팔로잉" 상태다. 비로그인 시 두 값 모두 false.
            `,
            responseType: PaginationResponseDto,
            itemType: FollowUserCardResponseDto,
            successDescription: '팔로워 목록 조회 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.followersRetrieved,
        }),
    );
}

export function ApiGetUserFollowingsEndpoint() {
    return applyDecorators(
        ApiParam({ name: 'userId', description: '조회 대상 사용자 ID', example: '507f1f77bcf86cd799439011' }),
        ApiPaginatedEndpoint({
            summary: '팔로잉 목록 (친구 목록 모달)',
            description: `
                대상 사용자가 팔로우하는 사용자 목록. 팔로우 최신순 정렬.
                isFollowing / isFollowedBy 규칙은 팔로워 목록과 동일하다.
            `,
            responseType: PaginationResponseDto,
            itemType: FollowUserCardResponseDto,
            successDescription: '팔로잉 목록 조회 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.followingsRetrieved,
        }),
    );
}

export function ApiRemoveMyFollowerEndpoint() {
    return applyDecorators(
        ApiParam({ name: 'userId', description: '삭제할 팔로워의 사용자 ID', example: '507f1f77bcf86cd799439011' }),
        ApiEndpoint({
            summary: '내 팔로워 삭제 (친구 목록 모달)',
            description: `
                상대가 나를 팔로우한 관계를 끊는다. 언팔로우(내가 남을 취소)와 방향이 반대다.
                팔로워가 아니었으면 removed: false 반환 (멱등).
            `,
            responseType: RemoveFollowerResponseDto,
            successDescription: '팔로워 삭제 성공',
            successMessageExample: PROFILE_RESPONSE_MESSAGES.followerRemoved,
        }),
    );
}
