import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiAppVersionAdminController } from '../swagger';

export function AppVersionAdminProtectedController() {
    return applyDecorators(
        ApiAppVersionAdminController(),
        Controller('app-version-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
