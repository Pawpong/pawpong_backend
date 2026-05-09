import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { StrictRolesGuard } from '../../../common/guard/strict-roles.guard';
import { ApiBreederPetPostingProtectedController } from '../swagger';

/**
 * v2 분양글 작성 — 브리더 전용.
 *
 * StrictRolesGuard 사용: 표준 RolesGuard 는 'breeder' 가 'adopter' 권한 API 도 통과시키는 fallback 이 있는데,
 * v2 신규 라우트에서는 의도하지 않은 권한 누출이 되지 않도록 strict 검증을 적용한다.
 * 'admin' 으로 분양글이 작성되는 것도 차단한다.
 */
export function BreederPetPostingProtectedController() {
    return applyDecorators(
        ApiBreederPetPostingProtectedController(),
        Controller('v2/breeder-pet-posting'),
        UseGuards(JwtAuthGuard, StrictRolesGuard),
        Roles('breeder'),
    );
}
