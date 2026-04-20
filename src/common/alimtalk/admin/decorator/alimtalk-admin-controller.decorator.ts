import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiAlimtalkAdminController } from '../swagger';

export function AlimtalkAdminProtectedController() {
    return applyDecorators(
        ApiAlimtalkAdminController(),
        Controller('alimtalk-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
