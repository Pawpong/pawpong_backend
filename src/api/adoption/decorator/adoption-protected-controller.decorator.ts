import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { ApiAdoptionProtectedController, ApiAdoptionPublicController } from '../swagger';

/**
 * 입양 페이지 공개 라우트 — 비로그인 접근 가능, 로그인 시 isFavorited 채움
 */
export function AdoptionOptionalAuthController() {
    return applyDecorators(
        ApiAdoptionPublicController(),
        Controller('v2/adoption'),
        UseGuards(OptionalJwtAuthGuard),
    );
}

/**
 * 입양 페이지 인증 필수 라우트 — 즐겨찾기 토글 등 입양자 전용
 * adopter 역할만 허용 (브리더/관리자가 카운터를 spam 하지 못하도록 차단)
 */
export function AdoptionProtectedController() {
    return applyDecorators(
        ApiAdoptionProtectedController(),
        Controller('v2/adoption'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('adopter'),
    );
}
