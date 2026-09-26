import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ContentRightsController } from './content-rights.controller';
import { ContentRightsWriteInterceptor } from '../../../common/content-rights/content-rights-write.interceptor';

@Module({
    controllers: [ContentRightsController],
    providers: [{ provide: APP_INTERCEPTOR, useClass: ContentRightsWriteInterceptor }],
})
export class ContentRightsModule {}
