import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppVersion, AppVersionSchema } from '../../schema/app-version.schema';
import { AppVersionController } from './app-version.controller';
import { AppVersionAdminController } from './admin/app-version-admin.controller';
import { AppVersionService } from './app-version.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { CheckAppVersionUseCase } from './application/use-cases/check-app-version.use-case';
import { AppVersionPolicyService } from './domain/services/app-version-policy.service';
import { AppVersionMongooseReaderAdapter } from './infrastructure/app-version-mongoose-reader.adapter';
import { APP_VERSION_READER } from './application/ports/app-version-reader.port';
import { APP_VERSION_ADMIN_READER } from './admin/application/ports/app-version-admin-reader.port';
import { APP_VERSION_WRITER } from './admin/application/ports/app-version-writer.port';
import { CreateAppVersionUseCase } from './admin/application/use-cases/create-app-version.use-case';
import { GetAppVersionListUseCase } from './admin/application/use-cases/get-app-version-list.use-case';
import { UpdateAppVersionUseCase } from './admin/application/use-cases/update-app-version.use-case';
import { DeleteAppVersionUseCase } from './admin/application/use-cases/delete-app-version.use-case';
import { AppVersionAdminCommandPolicyService } from './admin/domain/services/app-version-admin-command-policy.service';
import { AppVersionAdminPresentationService } from './admin/domain/services/app-version-admin-presentation.service';
import { AppVersionMongooseAdminReaderAdapter } from './admin/infrastructure/app-version-mongoose-admin-reader.adapter';
import { AppVersionMongooseWriterAdapter } from './admin/infrastructure/app-version-mongoose-writer.adapter';

/**
 * 앱 버전 관리 모듈
 * RN 앱의 강제/권장 업데이트 버전 정보 관리
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: AppVersion.name, schema: AppVersionSchema }])],
    controllers: [AppVersionController, AppVersionAdminController],
    providers: [
        AppVersionService,
        CustomLoggerService,
        CheckAppVersionUseCase,
        CreateAppVersionUseCase,
        GetAppVersionListUseCase,
        UpdateAppVersionUseCase,
        DeleteAppVersionUseCase,
        AppVersionPolicyService,
        AppVersionAdminCommandPolicyService,
        AppVersionAdminPresentationService,
        AppVersionMongooseReaderAdapter,
        AppVersionMongooseAdminReaderAdapter,
        AppVersionMongooseWriterAdapter,
        {
            provide: APP_VERSION_READER,
            useExisting: AppVersionMongooseReaderAdapter,
        },
        {
            provide: APP_VERSION_ADMIN_READER,
            useExisting: AppVersionMongooseAdminReaderAdapter,
        },
        {
            provide: APP_VERSION_WRITER,
            useExisting: AppVersionMongooseWriterAdapter,
        },
    ],
    exports: [AppVersionService],
})
export class AppVersionModule {}
