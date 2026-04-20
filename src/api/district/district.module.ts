import { Module } from '@nestjs/common';

import {
    DISTRICT_MODULE_CONTROLLERS,
    DISTRICT_MODULE_IMPORTS,
    DISTRICT_MODULE_PROVIDERS,
} from './district.module-definition';

@Module({
    imports: DISTRICT_MODULE_IMPORTS,
    controllers: DISTRICT_MODULE_CONTROLLERS,
    providers: DISTRICT_MODULE_PROVIDERS,
})
export class DistrictModule {}
