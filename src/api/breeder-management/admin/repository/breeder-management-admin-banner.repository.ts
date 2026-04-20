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
import type { BreederManagementBannerDocumentRecord } from '../../types/breeder-management-document.type';

@Injectable()
export class BreederManagementAdminBannerRepository {
    constructor(
        @InjectModel(AuthBanner.name) private readonly authBannerModel: Model<AuthBannerDocument>,
        @InjectModel(CounselBanner.name) private readonly counselBannerModel: Model<CounselBannerDocument>,
    ) {}

    findAllProfile(): Promise<BreederManagementBannerDocumentRecord[]> {
        return this.authBannerModel.find().sort({ bannerType: 1, order: 1 }).lean().exec() as Promise<
            BreederManagementBannerDocumentRecord[]
        >;
    }

    findActiveProfile(bannerType?: 'login' | 'signup'): Promise<BreederManagementBannerDocumentRecord[]> {
        const query: Record<string, unknown> = { isActive: true };
        if (bannerType) {
            query.bannerType = bannerType;
        }

        return this.authBannerModel.find(query).sort({ order: 1 }).lean().exec() as Promise<
            BreederManagementBannerDocumentRecord[]
        >;
    }

    findAllCounsel(): Promise<BreederManagementBannerDocumentRecord[]> {
        return this.counselBannerModel.find().sort({ order: 1 }).lean().exec() as Promise<
            BreederManagementBannerDocumentRecord[]
        >;
    }

    findActiveCounsel(): Promise<BreederManagementBannerDocumentRecord[]> {
        return this.counselBannerModel.find({ isActive: true }).sort({ order: 1 }).lean().exec() as Promise<
            BreederManagementBannerDocumentRecord[]
        >;
    }

    createProfile(data: BreederManagementProfileBannerCreateCommand): Promise<BreederManagementBannerDocumentRecord> {
        return this.authBannerModel.create(data) as Promise<BreederManagementBannerDocumentRecord>;
    }

    updateProfile(
        bannerId: string,
        data: BreederManagementProfileBannerUpdateCommand,
    ): Promise<BreederManagementBannerDocumentRecord | null> {
        return this.authBannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec() as Promise<
            BreederManagementBannerDocumentRecord | null
        >;
    }

    async deleteProfile(bannerId: string): Promise<boolean> {
        const deleted = await this.authBannerModel.findByIdAndDelete(bannerId).exec();
        return !!deleted;
    }

    createCounsel(data: BreederManagementCounselBannerCreateCommand): Promise<BreederManagementBannerDocumentRecord> {
        return this.counselBannerModel.create(data) as Promise<BreederManagementBannerDocumentRecord>;
    }

    updateCounsel(
        bannerId: string,
        data: BreederManagementCounselBannerUpdateCommand,
    ): Promise<BreederManagementBannerDocumentRecord | null> {
        return this.counselBannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec() as Promise<
            BreederManagementBannerDocumentRecord | null
        >;
    }

    async deleteCounsel(bannerId: string): Promise<boolean> {
        const deleted = await this.counselBannerModel.findByIdAndDelete(bannerId).exec();
        return !!deleted;
    }
}
