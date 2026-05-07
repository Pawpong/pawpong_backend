import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';
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
 */
export function AdoptionProtectedController() {
    return applyDecorators(
        ApiAdoptionProtectedController(),
        Controller('v2/adoption'),
        UseGuards(JwtAuthGuard),
    );
}
