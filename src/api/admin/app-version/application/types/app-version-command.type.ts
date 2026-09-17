export type AppVersionCreateCommand = {
    appIconKey?: 'default' | 'pixel';
    platform: 'ios' | 'android';
    latestVersion: string;
    minRequiredVersion: string;
    forceUpdateMessage: string;
    recommendUpdateMessage: string;
    iosStoreUrl: string;
    androidStoreUrl: string;
    isActive?: boolean;
};

export type AppVersionUpdateCommand = {
    appIconKey?: 'default' | 'pixel';
    latestVersion?: string;
    minRequiredVersion?: string;
    forceUpdateMessage?: string;
    recommendUpdateMessage?: string;
    iosStoreUrl?: string;
    androidStoreUrl?: string;
    isActive?: boolean;
};
