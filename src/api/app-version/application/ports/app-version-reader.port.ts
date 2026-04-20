export const APP_VERSION_READER_PORT = Symbol('APP_VERSION_READER_PORT');

export type ActiveAppVersionSnapshot = {
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
