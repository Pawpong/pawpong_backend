import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { ApiNotificationEmailPreviewAdminController } from '../swagger';

export function NotificationEmailPreviewAdminController() {
    return applyDecorators(
        ApiNotificationEmailPreviewAdminController(),
        Controller('email-test'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
