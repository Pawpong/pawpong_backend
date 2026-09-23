import { Inject, Injectable } from '@nestjs/common';
import { APP_SPLASH_STORE } from '../../../../service/app-splash/application/ports/app-splash-store.port';
import type { AppSplashStorePort } from '../../../../service/app-splash/application/ports/app-splash-store.port';
import { GetAppSplashUseCase } from '../../../../service/app-splash/application/use-cases/get-app-splash.use-case';
import type {
    AppSplashPlatform,
    AppSplashSettings,
} from '../../../../service/app-splash/application/types/app-splash.type';
import { APP_SPLASH_PLATFORMS } from '../../../../service/app-splash/constants/app-splash.constants';

@Injectable()
export class ManageAppSplashUseCase {
    constructor(
        @Inject(APP_SPLASH_STORE) private readonly store: AppSplashStorePort,
        private readonly read: GetAppSplashUseCase,
    ) {}
    /** 미등록 플랫폼도 함께 반환하여 관리자가 최초 설정을 바로 편집할 수 있게 한다. */
    list() {
        return Promise.all(APP_SPLASH_PLATFORMS.map((platform) => this.read.execute(platform)));
    }
    /** 전체 설정 교체로 이미지 제거와 비활성화를 명확히 처리한다. */
    async save(platform: AppSplashPlatform, settings: AppSplashSettings) {
        await this.store.save(platform, settings);
        return this.read.execute(platform);
    }
}
