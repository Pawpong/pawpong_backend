import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppVersion, AppVersionSchema } from '../../schema/app-version.schema';
import { AppVersionController } from './app-version.controller';
import { AppVersionAdminController } from './admin/app-version-admin.controller';
import { AppVersionService } from './app-version.service';
import { AppVersionAdminService } from './admin/app-version-admin.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { CheckAppVersionUseCase } from './application/use-cases/check-app-version.use-case';
import { AppVersionPolicyService } from './domain/services/app-version-policy.service';
import { AppVersionMongooseReaderAdapter } from './infrastructure/app-version-mongoose-reader.adapter';
import { APP_VERSION_READER } from './application/ports/app-version-reader.port';

/**
 * 앱 버전 관리 모듈
 * RN 앱의 강제/권장 업데이트 버전 정보 관리
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: AppVersion.name, schema: AppVersionSchema }])],
    controllers: [AppVersionController, AppVersionAdminController],
    providers: [
        AppVersionService,
        AppVersionAdminService,
        CustomLoggerService,
        CheckAppVersionUseCase,
        AppVersionPolicyService,
        AppVersionMongooseReaderAdapter,
        {
            provide: APP_VERSION_READER,
            useExisting: AppVersionMongooseReaderAdapter,
        },
    ],
    exports: [AppVersionService],
})
export class AppVersionModule {}
