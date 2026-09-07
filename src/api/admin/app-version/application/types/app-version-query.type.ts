export type AppVersionAdminListQuery = {
    page?: number;
    limit?: number;
    pageSize?: number;
};

export type AppVersionAdminItemResult = {
    /** 앱에 내장된 추천 아이콘. 미설정이면 기존 사용자 선택을 유지한다. */
    appIconKey?: 'default' | 'pixel';
    appVersionId: string;
    platform: 'ios' | 'android';
    latestVersion: string;
    minRequiredVersion: string;
    forceUpdateMessage: string;
    recommendUpdateMessage: string;
    iosStoreUrl: string;
    androidStoreUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AppVersionAdminPageResult = {
    items: AppVersionAdminItemResult[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
};
