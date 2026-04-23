import { Module } from '@nestjs/common';

import { HOME_MODULE_CONTROLLERS, HOME_MODULE_IMPORTS, HOME_MODULE_PROVIDERS } from './home.module-definition';

@Module({
    imports: HOME_MODULE_IMPORTS,
    controllers: HOME_MODULE_CONTROLLERS,
    providers: HOME_MODULE_PROVIDERS,
})
export class HomeModule {}
