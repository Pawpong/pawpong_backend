import { Module } from '@nestjs/common';
import {
    FILTER_OPTIONS_MODULE_CONTROLLERS,
    FILTER_OPTIONS_MODULE_IMPORTS,
    FILTER_OPTIONS_MODULE_PROVIDERS,
} from './filter-options.module-definition';

@Module({
    imports: FILTER_OPTIONS_MODULE_IMPORTS,
    controllers: FILTER_OPTIONS_MODULE_CONTROLLERS,
    providers: FILTER_OPTIONS_MODULE_PROVIDERS,
})
export class FilterOptionsModule {}
