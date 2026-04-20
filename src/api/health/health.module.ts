import { Module } from '@nestjs/common';
import { HEALTH_MODULE_CONTROLLERS, HEALTH_MODULE_PROVIDERS } from './health.module-definition';

@Module({
    controllers: HEALTH_MODULE_CONTROLLERS,
    providers: HEALTH_MODULE_PROVIDERS,
})
export class HealthModule {}
