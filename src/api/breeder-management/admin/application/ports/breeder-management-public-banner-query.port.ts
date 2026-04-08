import { CounselBannerResponseDto } from '../../dto/response/counsel-banner-response.dto';
import { ProfileBannerResponseDto } from '../../dto/response/profile-banner-response.dto';

export const GET_ACTIVE_PROFILE_BANNERS_QUERY = Symbol('GET_ACTIVE_PROFILE_BANNERS_QUERY');
export const GET_ACTIVE_COUNSEL_BANNERS_QUERY = Symbol('GET_ACTIVE_COUNSEL_BANNERS_QUERY');

export interface GetActiveProfileBannersQueryPort {
    execute(bannerType?: 'login' | 'signup'): Promise<ProfileBannerResponseDto[]>;
}

export interface GetActiveCounselBannersQueryPort {
    execute(): Promise<CounselBannerResponseDto[]>;
}
