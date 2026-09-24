import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { APP_MODULE_IMPORTS } from './app.module-definition';
import { AccountWriteFenceInterceptor } from './common/account-write-fence/account-write-fence.interceptor';

@Module({
    imports: APP_MODULE_IMPORTS,
    controllers: [],
    providers: [{ provide: APP_INTERCEPTOR, useClass: AccountWriteFenceInterceptor }],
})
export class AppModule {}
