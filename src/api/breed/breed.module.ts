import { Module } from '@nestjs/common';

import {
    BREED_MODULE_CONTROLLERS,
    BREED_MODULE_IMPORTS,
    BREED_MODULE_PROVIDERS,
} from './breed.module-definition';

@Module({
    imports: BREED_MODULE_IMPORTS,
    controllers: BREED_MODULE_CONTROLLERS,
    providers: BREED_MODULE_PROVIDERS,
})
export class BreedModule {}
