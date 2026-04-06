import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuthBanner } from '../../../../schema/auth-banner.schema';
import { CounselBanner } from '../../../../schema/counsel-banner.schema';
import {
    BreederManagementAdminBannerReaderPort,
    CounselBannerSnapshot,
    ProfileBannerSnapshot,
} from '../application/ports/breeder-management-admin-banner-reader.port';

@Injectable()
export class BreederManagementAdminBannerReaderAdapter implements BreederManagementAdminBannerReaderPort {
    constructor(
        @InjectModel(AuthBanner.name) private readonly authBannerModel: Model<AuthBanner>,
        @InjectModel(CounselBanner.name) private readonly counselBannerModel: Model<CounselBanner>,
    ) {}

    async readAllProfile(): Promise<ProfileBannerSnapshot[]> {
        const banners = await this.authBannerModel.find().sort({ bannerType: 1, order: 1 }).lean().exec();
        return banners.map((banner) => this.toProfileSnapshot(banner));
    }

    async readActiveProfile(bannerType?: 'login' | 'signup'): Promise<ProfileBannerSnapshot[]> {
        const query: Record<string, unknown> = { isActive: true };
        if (bannerType) {
            query.bannerType = bannerType;
        }

        const banners = await this.authBannerModel.find(query).sort({ order: 1 }).lean().exec();
        return banners.map((banner) => this.toProfileSnapshot(banner));
    }

    async readAllCounsel(): Promise<CounselBannerSnapshot[]> {
        const banners = await this.counselBannerModel.find().sort({ order: 1 }).lean().exec();
        return banners.map((banner) => this.toCounselSnapshot(banner));
    }

    async readActiveCounsel(): Promise<CounselBannerSnapshot[]> {
        const banners = await this.counselBannerModel.find({ isActive: true }).sort({ order: 1 }).lean().exec();
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
