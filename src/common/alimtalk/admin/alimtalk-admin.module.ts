import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AlimtalkTemplate, AlimtalkTemplateSchema } from '../../../schema/alimtalk-template.schema';
import { AlimtalkModule } from '../alimtalk.module';

import { CreateAlimtalkTemplateUseCase } from './application/use-cases/create-alimtalk-template.use-case';
import { DeleteAlimtalkTemplateUseCase } from './application/use-cases/delete-alimtalk-template.use-case';
import { GetAlimtalkTemplateByCodeUseCase } from './application/use-cases/get-alimtalk-template-by-code.use-case';
import { GetAlimtalkTemplatesUseCase } from './application/use-cases/get-alimtalk-templates.use-case';
import { RefreshAlimtalkTemplateCacheUseCase } from './application/use-cases/refresh-alimtalk-template-cache.use-case';
import { UpdateAlimtalkTemplateUseCase } from './application/use-cases/update-alimtalk-template.use-case';
import { AlimtalkAdminController } from './alimtalk-admin.controller';
import { AlimtalkAdminService } from './alimtalk-admin.service';
import { ALIMTALK_ADMIN_SERVICE_TOKEN } from './alimtalk-admin.token';

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
    providers: [
        GetAlimtalkTemplatesUseCase,
        GetAlimtalkTemplateByCodeUseCase,
        UpdateAlimtalkTemplateUseCase,
        CreateAlimtalkTemplateUseCase,
        DeleteAlimtalkTemplateUseCase,
        RefreshAlimtalkTemplateCacheUseCase,
        AlimtalkAdminService,
        {
            provide: ALIMTALK_ADMIN_SERVICE_TOKEN,
            useExisting: AlimtalkAdminService,
        },
    ],
    exports: [ALIMTALK_ADMIN_SERVICE_TOKEN, AlimtalkAdminService],
})
export class AlimtalkAdminModule {}
