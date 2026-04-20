import { Injectable } from '@nestjs/common';
import { CounselBannerSnapshot, ProfileBannerSnapshot } from '../application/ports/breeder-management-admin-banner-reader.port';
import { BreederManagementAdminBannerWriterPort } from '../application/ports/breeder-management-admin-banner-writer.port';
import type {
    BreederManagementCounselBannerCreateCommand,
    BreederManagementCounselBannerUpdateCommand,
    BreederManagementProfileBannerCreateCommand,
    BreederManagementProfileBannerUpdateCommand,
} from '../application/types/breeder-management-admin-banner-command.type';
import { BreederManagementAdminBannerRepository } from '../repository/breeder-management-admin-banner.repository';
import type { BreederManagementBannerDocumentRecord } from '../../types/breeder-management-document.type';

@Injectable()
export class BreederManagementAdminBannerWriterAdapter implements BreederManagementAdminBannerWriterPort {
    constructor(private readonly breederManagementAdminBannerRepository: BreederManagementAdminBannerRepository) {}

    async createProfile(data: BreederManagementProfileBannerCreateCommand): Promise<ProfileBannerSnapshot> {
        const banner = await this.breederManagementAdminBannerRepository.createProfile(data);
        return this.toProfileSnapshot(banner);
    }

    async updateProfile(
        bannerId: string,
        data: BreederManagementProfileBannerUpdateCommand,
    ): Promise<ProfileBannerSnapshot | null> {
        const banner = await this.breederManagementAdminBannerRepository.updateProfile(bannerId, data);
        return banner ? this.toProfileSnapshot(banner) : null;
    }

    async deleteProfile(bannerId: string): Promise<boolean> {
        return this.breederManagementAdminBannerRepository.deleteProfile(bannerId);
    }

    async createCounsel(data: BreederManagementCounselBannerCreateCommand): Promise<CounselBannerSnapshot> {
        const banner = await this.breederManagementAdminBannerRepository.createCounsel(data);
        return this.toCounselSnapshot(banner);
    }

    async updateCounsel(
        bannerId: string,
        data: BreederManagementCounselBannerUpdateCommand,
    ): Promise<CounselBannerSnapshot | null> {
        const banner = await this.breederManagementAdminBannerRepository.updateCounsel(bannerId, data);
        return banner ? this.toCounselSnapshot(banner) : null;
    }

    async deleteCounsel(bannerId: string): Promise<boolean> {
        return this.breederManagementAdminBannerRepository.deleteCounsel(bannerId);
    }

    private toProfileSnapshot(banner: BreederManagementBannerDocumentRecord): ProfileBannerSnapshot {
        return {
            bannerId: banner._id.toString(),
            imageFileName: banner.imageFileName,
            bannerType: banner.bannerType || 'login',
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        };
    }

    private toCounselSnapshot(banner: BreederManagementBannerDocumentRecord): CounselBannerSnapshot {
        return {
            bannerId: banner._id.toString(),
            imageFileName: banner.imageFileName,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        };
    }
}
