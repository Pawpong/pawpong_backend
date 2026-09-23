import type { AppSplashSettings } from '../application/types/app-splash.type';

/** 네이티브 기본 화면과 동일한 값. 서버에 설정이 없어도 첫 실행이 가능하다. */
export const APP_SPLASH_DEFAULTS: AppSplashSettings = {
    isEnabled: true,
    imageFileName: '',
    backgroundColor: '#FFFFFF',
    imageWidth: 200,
    durationMs: 1200,
};
export const APP_SPLASH_PLATFORMS = ['ios', 'android'] as const;
export const APP_SPLASH_READ_MESSAGE = '앱 스플래시 설정을 조회했습니다.';
export const APP_SPLASH_SAVE_MESSAGE = '앱 스플래시 설정을 저장했습니다.';
