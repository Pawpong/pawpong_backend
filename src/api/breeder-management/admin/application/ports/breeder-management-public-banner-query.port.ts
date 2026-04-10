import type {
    BreederManagementCounselBannerResult,
    BreederManagementProfileBannerResult,
} from '../types/breeder-management-admin-banner-result.type';

export const GET_ACTIVE_PROFILE_BANNERS_QUERY = Symbol('GET_ACTIVE_PROFILE_BANNERS_QUERY');
export const GET_ACTIVE_COUNSEL_BANNERS_QUERY = Symbol('GET_ACTIVE_COUNSEL_BANNERS_QUERY');

export interface GetActiveProfileBannersQueryPort {
    execute(bannerType?: 'login' | 'signup'): Promise<BreederManagementProfileBannerResult[]>;
}

export interface GetActiveCounselBannersQueryPort {
    execute(): Promise<BreederManagementCounselBannerResult[]>;
}
