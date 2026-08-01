export type AppVersionCheckResult = {
    needsForceUpdate: boolean;
    needsRecommendUpdate: boolean;
    latestVersion: string;
    message: string;
    storeUrl: string;
};
