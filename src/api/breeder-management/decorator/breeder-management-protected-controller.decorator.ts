import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { ApiBreederManagementController } from '../swagger';

export function BreederManagementProtectedController() {
    return applyDecorators(
        ApiBreederManagementController(),
        Controller('breeder-management'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('breeder'),
    );
}
