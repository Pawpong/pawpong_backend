import { Module } from '@nestjs/common';

import {
    HOME_ADMIN_MODULE_CONTROLLERS,
    HOME_ADMIN_MODULE_IMPORTS,
    HOME_ADMIN_MODULE_PROVIDERS,
} from './home-admin.module-definition';

@Module({
    imports: HOME_ADMIN_MODULE_IMPORTS,
    controllers: HOME_ADMIN_MODULE_CONTROLLERS,
    providers: HOME_ADMIN_MODULE_PROVIDERS,
})
export class HomeAdminModule {}
