import { Injectable } from '@nestjs/common';
import {
    BreederManagementAdminBannerReaderPort,
    CounselBannerSnapshot,
    ProfileBannerSnapshot,
} from '../application/ports/breeder-management-admin-banner-reader.port';
import { BreederManagementAdminBannerRepository } from '../repository/breeder-management-admin-banner.repository';

@Injectable()
export class BreederManagementAdminBannerReaderAdapter implements BreederManagementAdminBannerReaderPort {
    constructor(private readonly breederManagementAdminBannerRepository: BreederManagementAdminBannerRepository) {}

    async readAllProfile(): Promise<ProfileBannerSnapshot[]> {
        const banners = await this.breederManagementAdminBannerRepository.findAllProfile();
        return banners.map((banner) => this.toProfileSnapshot(banner));
    }

    async readActiveProfile(bannerType?: 'login' | 'signup'): Promise<ProfileBannerSnapshot[]> {
        const banners = await this.breederManagementAdminBannerRepository.findActiveProfile(bannerType);
        return banners.map((banner) => this.toProfileSnapshot(banner));
    }

    async readAllCounsel(): Promise<CounselBannerSnapshot[]> {
        const banners = await this.breederManagementAdminBannerRepository.findAllCounsel();
        return banners.map((banner) => this.toCounselSnapshot(banner));
    }

    async readActiveCounsel(): Promise<CounselBannerSnapshot[]> {
        const banners = await this.breederManagementAdminBannerRepository.findActiveCounsel();
        return banners.map((banner) => this.toCounselSnapshot(banner));
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
