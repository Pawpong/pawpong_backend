import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../../common/guard/optional-jwt-auth.guard';
import { StrictRolesGuard } from '../../../../common/guard/strict-roles.guard';
import { ApiProfileProtectedController, ApiProfilePublicController } from '../swagger/index';

/**
 * GET /v2/profile/me — 인증 필수, role 무관 (입양자/브리더 둘 다 본인 프로필 접근).
 */
export function ProfileMeController() {
    return applyDecorators(ApiProfileProtectedController(), Controller('v2/profile'), UseGuards(JwtAuthGuard));
}

/**
 * GET /v2/profile/me/favorite-breeders — 입양자·브리더 모두 조회 가능.
 *
 * 쓰기(POST/DELETE /v2/adopter/favorite)는 RolesGuard 의 breeder → adopter fallback 으로
 * 이미 브리더에게 열려 있고 Breeder.favoriteBreederList 에 저장된다. 읽기만 막으면
 * 담기는 되는데 목록은 늘 비어 보이므로 두 role 을 명시적으로 허용한다.
 * StrictRolesGuard 를 유지하는 이유는 암묵적 fallback 대신 화이트리스트를 코드에 드러내기 위함이다.
 */
export function ProfileFavoritesController() {
    return applyDecorators(
        ApiProfileProtectedController(),
        Controller('v2/profile'),
        UseGuards(JwtAuthGuard, StrictRolesGuard),
        Roles('adopter', 'breeder'),
    );
}

/**
 * GET /v2/profile/users/:userId, /v2/profile/breeders/:breederId — 공개.
 * 비로그인 접근 가능, 로그인 시 isFollowing/isFavorited 를 채워준다.
 */
export function ProfilePublicController() {
    return applyDecorators(ApiProfilePublicController(), Controller('v2/profile'), UseGuards(OptionalJwtAuthGuard));
}
