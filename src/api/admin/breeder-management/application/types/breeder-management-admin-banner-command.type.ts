export type BreederManagementProfileBannerCreateCommand = {
    imageFileName: string;
    bannerType: 'login' | 'signup';
    linkType?: 'internal' | 'external';
    linkUrl?: string;
    order: number;
    isActive?: boolean;
    title?: string;
    description?: string;
};

export type BreederManagementProfileBannerUpdateCommand = Partial<BreederManagementProfileBannerCreateCommand>;

export type BreederManagementCounselBannerCreateCommand = {
    imageFileName: string;
    linkType?: 'internal' | 'external';
    linkUrl?: string;
    title?: string;
    description?: string;
    order: number;
    isActive?: boolean;
};

export type BreederManagementCounselBannerUpdateCommand = Partial<BreederManagementCounselBannerCreateCommand>;
