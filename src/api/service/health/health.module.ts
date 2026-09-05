import { Module } from '@nestjs/common';
import { HEALTH_MODULE_CONTROLLERS, HEALTH_MODULE_IMPORTS, HEALTH_MODULE_PROVIDERS } from './health.module-definition';

@Module({
    imports: HEALTH_MODULE_IMPORTS,
    controllers: HEALTH_MODULE_CONTROLLERS,
    providers: HEALTH_MODULE_PROVIDERS,
})
export class HealthModule {}
