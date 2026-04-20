import { Module } from '@nestjs/common';
import {
    PLATFORM_ADMIN_MODULE_CONTROLLERS,
    PLATFORM_ADMIN_MODULE_IMPORTS,
    PLATFORM_ADMIN_MODULE_PROVIDERS,
} from './platform-admin.module-definition';

@Module({
    imports: PLATFORM_ADMIN_MODULE_IMPORTS,
    controllers: PLATFORM_ADMIN_MODULE_CONTROLLERS,
    providers: PLATFORM_ADMIN_MODULE_PROVIDERS,
})
export class PlatformAdminModule {}
