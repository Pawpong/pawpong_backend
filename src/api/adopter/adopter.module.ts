import { Module } from '@nestjs/common';
import {
    ADOPTER_MODULE_CONTROLLERS,
    ADOPTER_MODULE_IMPORTS,
    ADOPTER_MODULE_PROVIDERS,
} from './adopter.module-definition';

@Module({
    imports: ADOPTER_MODULE_IMPORTS,
    controllers: ADOPTER_MODULE_CONTROLLERS,
    providers: ADOPTER_MODULE_PROVIDERS,
})
export class AdopterModule {}
