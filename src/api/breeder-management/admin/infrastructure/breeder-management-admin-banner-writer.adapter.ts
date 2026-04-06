import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuthBanner } from '../../../../schema/auth-banner.schema';
import { CounselBanner } from '../../../../schema/counsel-banner.schema';
import { CounselBannerCreateRequestDto } from '../dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from '../dto/request/counsel-banner-update-request.dto';
import { ProfileBannerCreateRequestDto } from '../dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from '../dto/request/profile-banner-update-request.dto';
import { CounselBannerSnapshot, ProfileBannerSnapshot } from '../application/ports/breeder-management-admin-banner-reader.port';
import { BreederManagementAdminBannerWriterPort } from '../application/ports/breeder-management-admin-banner-writer.port';

@Injectable()
export class BreederManagementAdminBannerWriterAdapter implements BreederManagementAdminBannerWriterPort {
    constructor(
        @InjectModel(AuthBanner.name) private readonly authBannerModel: Model<AuthBanner>,
        @InjectModel(CounselBanner.name) private readonly counselBannerModel: Model<CounselBanner>,
    ) {}

    async createProfile(data: ProfileBannerCreateRequestDto): Promise<ProfileBannerSnapshot> {
        const banner = await this.authBannerModel.create(data);
        return this.toProfileSnapshot(banner);
    }

    async updateProfile(
        bannerId: string,
        data: ProfileBannerUpdateRequestDto,
    ): Promise<ProfileBannerSnapshot | null> {
        const banner = await this.authBannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec();
        return banner ? this.toProfileSnapshot(banner) : null;
    }

    async deleteProfile(bannerId: string): Promise<boolean> {
        const deleted = await this.authBannerModel.findByIdAndDelete(bannerId).exec();
        return !!deleted;
    }

    async createCounsel(data: CounselBannerCreateRequestDto): Promise<CounselBannerSnapshot> {
        const banner = await this.counselBannerModel.create(data);
        return this.toCounselSnapshot(banner);
    }

    async updateCounsel(
        bannerId: string,
        data: CounselBannerUpdateRequestDto,
    ): Promise<CounselBannerSnapshot | null> {
        const banner = await this.counselBannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec();
        return banner ? this.toCounselSnapshot(banner) : null;
    }

    async deleteCounsel(bannerId: string): Promise<boolean> {
        const deleted = await this.counselBannerModel.findByIdAndDelete(bannerId).exec();
        return !!deleted;
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
