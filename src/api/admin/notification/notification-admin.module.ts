import { Module } from '@nestjs/common';
import {
    NOTIFICATION_ADMIN_MODULE_CONTROLLERS,
    NOTIFICATION_ADMIN_MODULE_IMPORTS,
    NOTIFICATION_ADMIN_MODULE_PROVIDERS,
} from './notification-admin.module-definition';

@Module({
    imports: NOTIFICATION_ADMIN_MODULE_IMPORTS,
    controllers: NOTIFICATION_ADMIN_MODULE_CONTROLLERS,
    providers: NOTIFICATION_ADMIN_MODULE_PROVIDERS,
})
export class NotificationAdminModule {}
