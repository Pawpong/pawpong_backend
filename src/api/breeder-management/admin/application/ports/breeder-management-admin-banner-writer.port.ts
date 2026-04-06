import { CounselBannerCreateRequestDto } from '../../dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from '../../dto/request/counsel-banner-update-request.dto';
import { ProfileBannerCreateRequestDto } from '../../dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from '../../dto/request/profile-banner-update-request.dto';
import { CounselBannerSnapshot, ProfileBannerSnapshot } from './breeder-management-admin-banner-reader.port';

export const BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER = Symbol('BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER');

export interface BreederManagementAdminBannerWriterPort {
    createProfile(data: ProfileBannerCreateRequestDto): Promise<ProfileBannerSnapshot>;
    updateProfile(bannerId: string, data: ProfileBannerUpdateRequestDto): Promise<ProfileBannerSnapshot | null>;
    deleteProfile(bannerId: string): Promise<boolean>;
    createCounsel(data: CounselBannerCreateRequestDto): Promise<CounselBannerSnapshot>;
    updateCounsel(bannerId: string, data: CounselBannerUpdateRequestDto): Promise<CounselBannerSnapshot | null>;
    deleteCounsel(bannerId: string): Promise<boolean>;
}
