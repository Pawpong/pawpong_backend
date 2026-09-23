import type { AppSplashPlatform, AppSplashRecord, AppSplashSettings } from '../types/app-splash.type';

/** 공개 조회와 관리자 저장이 동일한 설정을 사용한다. */
export const APP_SPLASH_STORE = Symbol('APP_SPLASH_STORE');
export interface AppSplashStorePort {
    find(platform: AppSplashPlatform): Promise<AppSplashRecord | null>;
    save(platform: AppSplashPlatform, settings: AppSplashSettings): Promise<AppSplashRecord>;
}
