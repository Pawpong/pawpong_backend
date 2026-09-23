import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppSplash, AppSplashSchema } from '../../../schema/app-splash.schema';
import { StorageModule } from '../../../common/storage/storage.module';
import { AppSplashController } from './controller/app-splash.controller';
import { AppSplashAdminController } from '../../admin/app-splash/controller/app-splash-admin.controller';
import { ManageAppSplashUseCase } from '../../admin/app-splash/application/use-cases/manage-app-splash.use-case';
import { GetAppSplashUseCase } from './application/use-cases/get-app-splash.use-case';
import { AppSplashRepository } from './repository/app-splash.repository';
import { AppSplashStoreAdapter } from './infrastructure/app-splash-store.adapter';
import { AppSplashAssetsAdapter } from './infrastructure/app-splash-assets.adapter';
import { APP_SPLASH_STORE } from './application/ports/app-splash-store.port';
import { APP_SPLASH_ASSETS } from './application/ports/app-splash-assets.port';

/** 앱 시작 설정은 서비스 조회와 관리자 저장을 하나의 저장소에 연결한다. */
@Module({
    imports: [MongooseModule.forFeature([{ name: AppSplash.name, schema: AppSplashSchema }]), StorageModule],
    controllers: [AppSplashController, AppSplashAdminController],
    providers: [
        GetAppSplashUseCase,
        ManageAppSplashUseCase,
        AppSplashRepository,
        AppSplashStoreAdapter,
        AppSplashAssetsAdapter,
        { provide: APP_SPLASH_STORE, useExisting: AppSplashStoreAdapter },
        { provide: APP_SPLASH_ASSETS, useExisting: AppSplashAssetsAdapter },
    ],
})
export class AppSplashModule {}
