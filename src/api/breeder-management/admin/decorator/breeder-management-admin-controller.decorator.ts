import { applyDecorators, Controller, UseGuards } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiBreederManagementAdminController } from '../swagger';

export function BreederManagementAdminProtectedController() {
    return applyDecorators(
        ApiBreederManagementAdminController(),
        Controller('breeder-management-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}

export function BreederManagementAdminPublicController() {
    return applyDecorators(ApiBreederManagementAdminController(), Controller('breeder-management-admin'));
}
