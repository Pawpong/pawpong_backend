import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../../common/guard/roles.guard';
import { ApiBreederReportAdminController } from '../swagger';

export function BreederReportAdminProtectedController() {
    return applyDecorators(
        ApiBreederReportAdminController(),
        Controller('breeder-report-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
