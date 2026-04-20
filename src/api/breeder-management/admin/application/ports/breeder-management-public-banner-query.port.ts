import type {
    BreederManagementCounselBannerResult,
    BreederManagementProfileBannerResult,
} from '../types/breeder-management-admin-banner-result.type';

export interface GetActiveProfileBannersQueryPort {
    execute(bannerType?: 'login' | 'signup'): Promise<BreederManagementProfileBannerResult[]>;
}

export interface GetActiveCounselBannersQueryPort {
    execute(): Promise<BreederManagementCounselBannerResult[]>;
}
