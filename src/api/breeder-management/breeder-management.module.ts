import { Module } from '@nestjs/common';
import {
    BREEDER_MANAGEMENT_MODULE_CONTROLLERS,
    BREEDER_MANAGEMENT_MODULE_EXPORTS,
    BREEDER_MANAGEMENT_MODULE_IMPORTS,
    BREEDER_MANAGEMENT_MODULE_PROVIDERS,
} from './breeder-management.module-definition';

@Module({
    imports: BREEDER_MANAGEMENT_MODULE_IMPORTS,
    controllers: BREEDER_MANAGEMENT_MODULE_CONTROLLERS,
    providers: BREEDER_MANAGEMENT_MODULE_PROVIDERS,
    exports: BREEDER_MANAGEMENT_MODULE_EXPORTS,
})
export class BreederManagementModule {}
