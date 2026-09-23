import { Injectable } from '@nestjs/common';
import type { AppSplashStorePort } from '../application/ports/app-splash-store.port';
import type { AppSplashPlatform, AppSplashSettings } from '../application/types/app-splash.type';
import { AppSplashRepository } from '../repository/app-splash.repository';

@Injectable()
export class AppSplashStoreAdapter implements AppSplashStorePort {
    constructor(private readonly repository: AppSplashRepository) {}
    /** 플랫폼 설정 조회를 저장소에 위임한다. */
    find(platform: AppSplashPlatform) {
        return this.repository.find(platform);
    }
    /** 플랫폼 설정 저장을 저장소에 위임한다. */
    save(platform: AppSplashPlatform, settings: AppSplashSettings) {
        return this.repository.save(platform, settings);
    }
}
