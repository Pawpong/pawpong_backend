/** 플랫폼마다 독립적으로 운영하는 앱 진입 화면 설정. 빈 파일키는 번들 로고를 뜻한다. */
export type AppSplashPlatform = 'ios' | 'android';

export interface AppSplashSettings {
    isEnabled: boolean;
    imageFileName: string;
    backgroundColor: string;
    imageWidth: number;
    durationMs: number;
}

export interface AppSplashRecord extends AppSplashSettings {
    platform: AppSplashPlatform;
    updatedAt: Date | null;
}

export interface AppSplashResult extends AppSplashSettings {
    platform: AppSplashPlatform;
    imageUrl: string;
    updatedAt: string | null;
}
