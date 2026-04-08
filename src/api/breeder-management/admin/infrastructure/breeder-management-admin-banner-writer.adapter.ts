import { Injectable } from '@nestjs/common';
import { CounselBannerCreateRequestDto } from '../dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from '../dto/request/counsel-banner-update-request.dto';
import { ProfileBannerCreateRequestDto } from '../dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from '../dto/request/profile-banner-update-request.dto';
import { CounselBannerSnapshot, ProfileBannerSnapshot } from '../application/ports/breeder-management-admin-banner-reader.port';
import { BreederManagementAdminBannerWriterPort } from '../application/ports/breeder-management-admin-banner-writer.port';
import { BreederManagementAdminBannerRepository } from '../repository/breeder-management-admin-banner.repository';

@Injectable()
export class BreederManagementAdminBannerWriterAdapter implements BreederManagementAdminBannerWriterPort {
    constructor(private readonly breederManagementAdminBannerRepository: BreederManagementAdminBannerRepository) {}

    async createProfile(data: ProfileBannerCreateRequestDto): Promise<ProfileBannerSnapshot> {
        const banner = await this.breederManagementAdminBannerRepository.createProfile(data);
        return this.toProfileSnapshot(banner);
    }

    async updateProfile(
        bannerId: string,
        data: ProfileBannerUpdateRequestDto,
    ): Promise<ProfileBannerSnapshot | null> {
        const banner = await this.breederManagementAdminBannerRepository.updateProfile(bannerId, data);
        return banner ? this.toProfileSnapshot(banner) : null;
    }

    async deleteProfile(bannerId: string): Promise<boolean> {
        return this.breederManagementAdminBannerRepository.deleteProfile(bannerId);
    }

    async createCounsel(data: CounselBannerCreateRequestDto): Promise<CounselBannerSnapshot> {
        const banner = await this.breederManagementAdminBannerRepository.createCounsel(data);
        return this.toCounselSnapshot(banner);
    }

    async updateCounsel(
        bannerId: string,
        data: CounselBannerUpdateRequestDto,
    ): Promise<CounselBannerSnapshot | null> {
        const banner = await this.breederManagementAdminBannerRepository.updateCounsel(bannerId, data);
        return banner ? this.toCounselSnapshot(banner) : null;
    }

    async deleteCounsel(bannerId: string): Promise<boolean> {
        return this.breederManagementAdminBannerRepository.deleteCounsel(bannerId);
    }

    private toProfileSnapshot(banner: any): ProfileBannerSnapshot {
        return {
            bannerId: banner._id.toString(),
            imageFileName: banner.imageFileName,
            bannerType: banner.bannerType,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        };
    }

    private toCounselSnapshot(banner: any): CounselBannerSnapshot {
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
