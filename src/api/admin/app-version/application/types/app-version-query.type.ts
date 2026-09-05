export type AppVersionAdminListQuery = {
    page?: number;
    limit?: number;
    pageSize?: number;
};

export type AppVersionAdminItemResult = {
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
