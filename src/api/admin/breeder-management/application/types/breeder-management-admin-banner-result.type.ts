export type BreederManagementCounselBannerResult = {
    bannerId: string;
    imageUrl: string;
    imageFileName: string;
    linkType?: string;
    linkUrl?: string;
    title?: string;
    description?: string;
    order: number;
    isActive: boolean;
};

export type BreederManagementProfileBannerResult = BreederManagementCounselBannerResult & {
    bannerType: string;
};
