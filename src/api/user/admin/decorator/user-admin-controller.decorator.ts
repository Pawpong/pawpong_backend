import { applyDecorators, Controller, UseGuards } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiUserAdminController } from '../swagger';

export function UserAdminProtectedController() {
    return applyDecorators(
        ApiUserAdminController(),
        Controller('user-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
