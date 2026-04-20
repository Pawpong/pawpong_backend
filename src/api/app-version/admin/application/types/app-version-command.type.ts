export type AppVersionCreateCommand = {
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
    latestVersion?: string;
    minRequiredVersion?: string;
    forceUpdateMessage?: string;
    recommendUpdateMessage?: string;
    iosStoreUrl?: string;
    androidStoreUrl?: string;
    isActive?: boolean;
};
