import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppVersion, AppVersionSchema } from '../../schema/app-version.schema';
import { AppVersionController } from './app-version.controller';
import { AppVersionAdminController } from './admin/app-version-admin.controller';
import { AppVersionService } from './app-version.service';
import { AppVersionAdminService } from './admin/app-version-admin.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

/**
 * 앱 버전 관리 모듈
 * RN 앱의 강제/권장 업데이트 버전 정보 관리
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: AppVersion.name, schema: AppVersionSchema }])],
    controllers: [AppVersionController, AppVersionAdminController],
    providers: [AppVersionService, AppVersionAdminService, CustomLoggerService],
    exports: [AppVersionService],
})
export class AppVersionModule {}
