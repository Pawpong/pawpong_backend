import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiController } from '../../../../common/decorator/swagger.decorator';

export function CommunityAdminController() {
    return applyDecorators(
        ApiController('커뮤니티 관리자 (v2)'),
        Controller('community-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
