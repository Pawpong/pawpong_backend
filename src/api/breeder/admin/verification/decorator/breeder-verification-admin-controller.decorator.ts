import { applyDecorators, Controller, UseGuards } from '@nestjs/common';

import { Roles } from '../../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../../common/guard/roles.guard';
import { ApiBreederVerificationAdminController } from '../swagger';

export function BreederVerificationAdminProtectedController() {
    return applyDecorators(
        ApiBreederVerificationAdminController(),
        Controller('breeder-verification-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
