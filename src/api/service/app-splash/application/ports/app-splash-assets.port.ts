/** 파일키를 현재 CDN 주소로 변환하는 경계. */
export const APP_SPLASH_ASSETS = Symbol('APP_SPLASH_ASSETS');
export interface AppSplashAssetsPort {
    imageUrl(fileName: string): string;
}
