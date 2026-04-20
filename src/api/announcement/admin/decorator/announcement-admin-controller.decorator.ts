import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiAnnouncementAdminController } from '../swagger';

export function AnnouncementAdminProtectedController() {
    return applyDecorators(
        ApiAnnouncementAdminController(),
        Controller('announcement-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
