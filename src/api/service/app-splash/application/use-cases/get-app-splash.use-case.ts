import { Inject, Injectable } from '@nestjs/common';
import { APP_SPLASH_STORE } from '../ports/app-splash-store.port';
import type { AppSplashStorePort } from '../ports/app-splash-store.port';
import { APP_SPLASH_ASSETS } from '../ports/app-splash-assets.port';
import type { AppSplashAssetsPort } from '../ports/app-splash-assets.port';
import type { AppSplashPlatform, AppSplashResult } from '../types/app-splash.type';
import { APP_SPLASH_DEFAULTS } from '../../constants/app-splash.constants';

@Injectable()
export class GetAppSplashUseCase {
    constructor(
        @Inject(APP_SPLASH_STORE) private readonly store: AppSplashStorePort,
        @Inject(APP_SPLASH_ASSETS) private readonly assets: AppSplashAssetsPort,
    ) {}
    /** 미등록 플랫폼에도 기본값을 반환하여 신규 설치 앱의 시작을 보장한다. */
    async execute(platform: AppSplashPlatform): Promise<AppSplashResult> {
        const record = await this.store.find(platform);
        return {
            platform,
            isEnabled: record?.isEnabled ?? APP_SPLASH_DEFAULTS.isEnabled,
            imageFileName: record?.imageFileName ?? '',
            imageUrl: this.assets.imageUrl(record?.imageFileName ?? ''),
            backgroundColor: record?.backgroundColor ?? APP_SPLASH_DEFAULTS.backgroundColor,
            imageWidth: record?.imageWidth ?? APP_SPLASH_DEFAULTS.imageWidth,
            durationMs: record?.durationMs ?? APP_SPLASH_DEFAULTS.durationMs,
            updatedAt: record?.updatedAt?.toISOString() ?? null,
        };
    }
}
