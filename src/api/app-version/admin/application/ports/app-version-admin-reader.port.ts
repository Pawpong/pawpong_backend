export interface AppVersionAdminSnapshot {
    appVersionId: string;
    platform: 'ios' | 'android';
    latestVersion: string;
    minRequiredVersion: string;
    forceUpdateMessage: string;
    recommendUpdateMessage: string;
    iosStoreUrl: string;
    androidStoreUrl: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AppVersionAdminPage {
    items: AppVersionAdminSnapshot[];
    totalItems: number;
}

export const APP_VERSION_ADMIN_READER_PORT = Symbol('APP_VERSION_ADMIN_READER_PORT');

export interface AppVersionAdminReaderPort {
    readPage(page: number, limit: number): Promise<AppVersionAdminPage>;
}
