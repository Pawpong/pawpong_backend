import { CounselBannerSnapshot, ProfileBannerSnapshot } from './breeder-management-admin-banner-reader.port';
import type {
    BreederManagementCounselBannerCreateCommand,
    BreederManagementCounselBannerUpdateCommand,
    BreederManagementProfileBannerCreateCommand,
    BreederManagementProfileBannerUpdateCommand,
} from '../types/breeder-management-admin-banner-command.type';

export const BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER = Symbol('BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER');

export interface BreederManagementAdminBannerWriterPort {
    createProfile(data: BreederManagementProfileBannerCreateCommand): Promise<ProfileBannerSnapshot>;
    updateProfile(
        bannerId: string,
        data: BreederManagementProfileBannerUpdateCommand,
    ): Promise<ProfileBannerSnapshot | null>;
    deleteProfile(bannerId: string): Promise<boolean>;
    createCounsel(data: BreederManagementCounselBannerCreateCommand): Promise<CounselBannerSnapshot>;
    updateCounsel(
        bannerId: string,
        data: BreederManagementCounselBannerUpdateCommand,
    ): Promise<CounselBannerSnapshot | null>;
    deleteCounsel(bannerId: string): Promise<boolean>;
}
