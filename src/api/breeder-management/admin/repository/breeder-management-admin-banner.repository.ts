import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuthBanner, AuthBannerDocument } from '../../../../schema/auth-banner.schema';
import { CounselBanner, CounselBannerDocument } from '../../../../schema/counsel-banner.schema';
import type {
    BreederManagementCounselBannerCreateCommand,
    BreederManagementCounselBannerUpdateCommand,
    BreederManagementProfileBannerCreateCommand,
    BreederManagementProfileBannerUpdateCommand,
} from '../application/types/breeder-management-admin-banner-command.type';

@Injectable()
export class BreederManagementAdminBannerRepository {
    constructor(
        @InjectModel(AuthBanner.name) private readonly authBannerModel: Model<AuthBannerDocument>,
        @InjectModel(CounselBanner.name) private readonly counselBannerModel: Model<CounselBannerDocument>,
    ) {}

    findAllProfile() {
        return this.authBannerModel.find().sort({ bannerType: 1, order: 1 }).lean().exec();
    }

    findActiveProfile(bannerType?: 'login' | 'signup') {
        const query: Record<string, unknown> = { isActive: true };
        if (bannerType) {
            query.bannerType = bannerType;
        }

        return this.authBannerModel.find(query).sort({ order: 1 }).lean().exec();
    }

    findAllCounsel() {
        return this.counselBannerModel.find().sort({ order: 1 }).lean().exec();
    }

    findActiveCounsel() {
        return this.counselBannerModel.find({ isActive: true }).sort({ order: 1 }).lean().exec();
    }

    createProfile(data: BreederManagementProfileBannerCreateCommand) {
        return this.authBannerModel.create(data);
    }

    updateProfile(bannerId: string, data: BreederManagementProfileBannerUpdateCommand) {
        return this.authBannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec();
    }

    async deleteProfile(bannerId: string): Promise<boolean> {
        const deleted = await this.authBannerModel.findByIdAndDelete(bannerId).exec();
        return !!deleted;
    }

    createCounsel(data: BreederManagementCounselBannerCreateCommand) {
        return this.counselBannerModel.create(data);
    }

    updateCounsel(bannerId: string, data: BreederManagementCounselBannerUpdateCommand) {
        return this.counselBannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec();
    }

    async deleteCounsel(bannerId: string): Promise<boolean> {
        const deleted = await this.counselBannerModel.findByIdAndDelete(bannerId).exec();
        return !!deleted;
    }
}
