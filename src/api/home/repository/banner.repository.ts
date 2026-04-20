import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Banner, BannerDocument } from '../../../schema/banner.schema';
import type { HomeBannerCommand, HomeBannerUpdateCommand } from '../admin/application/types/home-admin-command.type';

@Injectable()
export class BannerRepository {
    constructor(@InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>) {}

    findActiveOrdered(): Promise<BannerDocument[]> {
        return this.bannerModel.find({ isActive: true }).sort({ order: 1 }).exec();
    }

    findAllOrdered(): Promise<BannerDocument[]> {
        return this.bannerModel.find().sort({ order: 1 }).exec();
    }

    create(data: HomeBannerCommand): Promise<BannerDocument> {
        return this.bannerModel.create(data);
    }

    update(bannerId: string, data: HomeBannerUpdateCommand): Promise<BannerDocument | null> {
        return this.bannerModel.findByIdAndUpdate(bannerId, data, { new: true }).exec();
    }

    async deleteById(bannerId: string): Promise<boolean> {
        const result = await this.bannerModel.findByIdAndDelete(bannerId).exec();
        return !!result;
    }
}
