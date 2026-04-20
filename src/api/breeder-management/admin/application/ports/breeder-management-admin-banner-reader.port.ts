export interface ProfileBannerSnapshot {
    bannerId: string;
    imageFileName: string;
    bannerType: 'login' | 'signup';
    linkType?: string;
    linkUrl?: string;
    title?: string;
    description?: string;
    order: number;
    isActive: boolean;
}

export interface CounselBannerSnapshot {
    bannerId: string;
    imageFileName: string;
    linkType?: string;
    linkUrl?: string;
    title?: string;
    description?: string;
    order: number;
    isActive: boolean;
}

export const BREEDER_MANAGEMENT_ADMIN_BANNER_READER_PORT = Symbol('BREEDER_MANAGEMENT_ADMIN_BANNER_READER_PORT');

export interface BreederManagementAdminBannerReaderPort {
    readAllProfile(): Promise<ProfileBannerSnapshot[]>;
    readActiveProfile(bannerType?: 'login' | 'signup'): Promise<ProfileBannerSnapshot[]>;
    readAllCounsel(): Promise<CounselBannerSnapshot[]>;
    readActiveCounsel(): Promise<CounselBannerSnapshot[]>;
}
