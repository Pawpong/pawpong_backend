import { Module } from '@nestjs/common';

import {
    BREEDER_MODULE_CONTROLLERS,
    BREEDER_MODULE_IMPORTS,
    BREEDER_MODULE_PROVIDERS,
} from './breeder.module-definition';

@Module({
    imports: BREEDER_MODULE_IMPORTS,
    controllers: BREEDER_MODULE_CONTROLLERS,
    providers: BREEDER_MODULE_PROVIDERS,
})
export class BreederModule {}
