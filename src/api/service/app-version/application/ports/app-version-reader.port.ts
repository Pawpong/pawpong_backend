export const APP_VERSION_READER_PORT = Symbol('APP_VERSION_READER_PORT');

export type ActiveAppVersionSnapshot = {
    /** 앱에 내장된 추천 아이콘. 미설정이면 기존 사용자 선택을 유지한다. */
    appIconKey?: 'default' | 'pixel';
    readonly latestVersion: string;
    readonly minRequiredVersion: string;
    readonly forceUpdateMessage: string;
    readonly recommendUpdateMessage: string;
    readonly iosStoreUrl: string;
    readonly androidStoreUrl: string;
};

export interface AppVersionReaderPort {
    findLatestActiveByPlatform(platform: 'ios' | 'android'): Promise<ActiveAppVersionSnapshot | null>;
}
