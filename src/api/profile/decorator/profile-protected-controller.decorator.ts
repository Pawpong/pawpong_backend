import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';
import { StrictRolesGuard } from '../../../common/guard/strict-roles.guard';
import { ApiProfileProtectedController, ApiProfilePublicController } from '../swagger';

/**
 * GET /v2/profile/me — 인증 필수, role 무관 (입양자/브리더 둘 다 본인 프로필 접근).
 */
export function ProfileMeController() {
    return applyDecorators(
        ApiProfileProtectedController(),
        Controller('v2/profile'),
        UseGuards(JwtAuthGuard),
    );
}

/**
 * GET /v2/profile/me/favorite-breeders — 입양자 전용.
 * 표준 RolesGuard 의 brand → adopter fallback 을 차단하기 위해 StrictRolesGuard 사용.
 */
export function ProfileFavoritesController() {
    return applyDecorators(
        ApiProfileProtectedController(),
        Controller('v2/profile'),
        UseGuards(JwtAuthGuard, StrictRolesGuard),
        Roles('adopter'),
    );
}

/**
 * GET /v2/profile/users/:userId, /v2/profile/breeders/:breederId — 공개.
 * 비로그인 접근 가능, 로그인 시 isFollowing/isFavorited 를 채워준다.
 */
export function ProfilePublicController() {
    return applyDecorators(
        ApiProfilePublicController(),
        Controller('v2/profile'),
        UseGuards(OptionalJwtAuthGuard),
    );
}
