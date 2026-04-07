import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiAdopterAdminController } from '../swagger';

export function AdopterAdminProtectedController() {
    return applyDecorators(
        ApiAdopterAdminController(),
        Controller('adopter-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
