import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiNotificationEmailPreviewAdminController } from '../swagger/index';

export function NotificationEmailPreviewAdminController() {
    return applyDecorators(
        ApiNotificationEmailPreviewAdminController(),
        Controller('notification-email-preview-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
