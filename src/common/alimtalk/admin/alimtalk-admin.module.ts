import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AlimtalkTemplate, AlimtalkTemplateSchema } from '../../../schema/alimtalk-template.schema';
import { AlimtalkModule } from '../alimtalk.module';

import { AlimtalkAdminController } from './alimtalk-admin.controller';
import { AlimtalkAdminService } from './alimtalk-admin.service';

/**
 * 알림톡 템플릿 관리 Admin 모듈
 *
 * 관리자가 알림톡 템플릿을 조회/수정할 수 있는 기능을 제공합니다.
 */
@Module({
    imports: [
        MongooseModule.forFeature([{ name: AlimtalkTemplate.name, schema: AlimtalkTemplateSchema }]),
        AlimtalkModule, // AlimtalkService 사용을 위해 import
    ],
    controllers: [AlimtalkAdminController],
    providers: [AlimtalkAdminService],
    exports: [AlimtalkAdminService],
})
export class AlimtalkAdminModule {}
