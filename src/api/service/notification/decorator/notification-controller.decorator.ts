import { applyDecorators, Controller, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { ApiNotificationController } from '../swagger/index';

export function NotificationProtectedController() {
    return applyDecorators(ApiNotificationController(), Controller('v2/notification'), UseGuards(JwtAuthGuard));
}
