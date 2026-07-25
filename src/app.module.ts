import { Module } from '@nestjs/common';
import { APP_MODULE_IMPORTS } from './app.module-definition';

@Module({
    imports: APP_MODULE_IMPORTS,
    controllers: [],
    providers: [],
})
export class AppModule {}
