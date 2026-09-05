import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../../common/guard/optional-jwt-auth.guard';
import { StrictRolesGuard } from '../../../../common/guard/strict-roles.guard';
import { ApiAdoptionProtectedController, ApiAdoptionPublicController } from '../swagger/index';

/**
 * 입양 페이지 공개 라우트 — 비로그인 접근 가능, 로그인 시 isFavorited 채움
 */
export function AdoptionOptionalAuthController() {
    return applyDecorators(ApiAdoptionPublicController(), Controller('v2/adoption'), UseGuards(OptionalJwtAuthGuard));
}

/**
 * 입양 페이지 인증 필수 라우트 — 입양자 전용 (GET /me/adopted)
 *
 * 입양 신청(POST /v2/adoption-application) 자체가 adopter 전용이라 브리더는 입양 이력을 가질 수 없다.
 * 표준 RolesGuard 의 breeder → adopter 자동 부여를 타지 않도록 StrictRolesGuard 를 쓴다.
 */
export function AdoptionProtectedController() {
    return applyDecorators(
        ApiAdoptionProtectedController(),
        Controller('v2/adoption'),
        UseGuards(JwtAuthGuard, StrictRolesGuard),
        Roles('adopter'),
    );
}

/**
 * 동물 단위 관심(하트) 토글·목록 — 입양자·브리더 모두 허용.
 *
 * 과거에는 'brand 가 카운터를 spam 하지 못하도록' 이라는 이유로 브리더를 막았으나
 * 그 시나리오는 성립하지 않는다 — adopter_pet_favorites 에 (adopterId, petId) 유니크 인덱스가 있고
 * addAtomic 이 duplicate key 를 멱등 처리해서, 한 계정이 몇 번을 누르든 favoriteCount 는 최대 +1 이다.
 * 브리더가 '자기 펫'을 눌러 인기 정렬을 self-boost 하는 위험은
 * AddAdoptionPetFavoriteUseCase 의 소유자 검증으로 차단한다.
 */
export function AdoptionFavoritesController() {
    return applyDecorators(
        ApiAdoptionProtectedController(),
        Controller('v2/adoption'),
        UseGuards(JwtAuthGuard, StrictRolesGuard),
        Roles('adopter', 'breeder'),
    );
}
