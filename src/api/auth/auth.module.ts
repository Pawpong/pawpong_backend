import { Module } from '@nestjs/common';
import { AUTH_MODULE_CONTROLLERS, AUTH_MODULE_IMPORTS, AUTH_MODULE_PROVIDERS } from './auth.module-definition';

@Module({
    imports: AUTH_MODULE_IMPORTS,
    controllers: AUTH_MODULE_CONTROLLERS,
    providers: AUTH_MODULE_PROVIDERS,
})
export class AuthModule {}
