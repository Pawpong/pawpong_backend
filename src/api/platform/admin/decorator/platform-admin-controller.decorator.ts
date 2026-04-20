import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiPlatformAdminController } from '../swagger';

export function PlatformAdminProtectedController() {
    return applyDecorators(
        ApiPlatformAdminController(),
        Controller('platform-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
