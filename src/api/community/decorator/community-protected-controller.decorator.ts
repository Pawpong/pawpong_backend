import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { ApiCommunityProtectedController } from '../swagger';

/**
 * v2 커뮤니티 작성/수정/삭제 — 입양자/브리더 모두 작성자가 될 수 있어 role 제한 없이 JWT 만 강제.
 */
export function CommunityProtectedController() {
    return applyDecorators(
        ApiCommunityProtectedController(),
        Controller('v2/community'),
        UseGuards(JwtAuthGuard),
    );
}
