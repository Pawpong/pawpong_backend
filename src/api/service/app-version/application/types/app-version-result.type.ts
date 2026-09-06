export type AppVersionCheckResult = {
    /** 앱에 내장된 추천 아이콘. 미설정이면 기존 사용자 선택을 유지한다. */
    appIconKey?: 'default' | 'pixel';
    needsForceUpdate: boolean;
    needsRecommendUpdate: boolean;
    latestVersion: string;
    message: string;
    storeUrl: string;
};
