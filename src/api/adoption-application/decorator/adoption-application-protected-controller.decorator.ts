import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { StrictRolesGuard } from '../../../common/guard/strict-roles.guard';
import { ApiAdoptionApplicationProtectedController } from '../swagger';

/**
 * v2 입양 신청 — 입양자 전용.
 *
 * 표준 RolesGuard 의 'breeder' → 'adopter' fallback 을 우회하지 않기 위해 StrictRolesGuard 사용.
 * 브리더/관리자가 입양 신청을 가장하는 경로를 차단한다.
 */
export function AdoptionApplicationProtectedController() {
    return applyDecorators(
        ApiAdoptionApplicationProtectedController(),
        Controller('v2/adoption-application'),
        UseGuards(JwtAuthGuard, StrictRolesGuard),
        Roles('adopter'),
    );
}
