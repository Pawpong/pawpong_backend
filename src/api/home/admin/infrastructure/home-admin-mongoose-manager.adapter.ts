import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Banner, BannerDocument } from '../../../../schema/banner.schema';
import { Faq, FaqDocument } from '../../../../schema/faq.schema';
import { BannerCreateRequestDto } from '../dto/request/banner-create-request.dto';
import { BannerUpdateRequestDto } from '../dto/request/banner-update-request.dto';
import { FaqCreateRequestDto } from '../dto/request/faq-create-request.dto';
import { FaqUpdateRequestDto } from '../dto/request/faq-update-request.dto';
import { HomeAdminManagerPort } from '../application/ports/home-admin-manager.port';
import { HomeBannerSnapshot, HomeFaqSnapshot } from '../../application/ports/home-content-reader.port';

@Injectable()
export class HomeAdminMongooseManagerAdapter implements HomeAdminManagerPort {
    constructor(
        @InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>,
        @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
    ) {}

    async readAllBanners(): Promise<HomeBannerSnapshot[]> {
        const banners = await this.bannerModel.find().sort({ order: 1 }).lean().exec();
        return banners.map((banner) => this.toBannerSnapshot(banner));
    }

    async createBanner(data: BannerCreateRequestDto): Promise<HomeBannerSnapshot> {
        const banner = await this.bannerModel.create(data);
        return this.toBannerSnapshot(banner);
    }

    async updateBanner(bannerId: string, data: BannerUpdateRequestDto): Promise<HomeBannerSnapshot | null> {
        const banner = await this.bannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec();
        return banner ? this.toBannerSnapshot(banner) : null;
    }

    async deleteBanner(bannerId: string): Promise<boolean> {
        const result = await this.bannerModel.findByIdAndDelete(bannerId).exec();
        return !!result;
    }

    async readAllFaqs(): Promise<HomeFaqSnapshot[]> {
        const faqs = await this.faqModel.find().sort({ order: 1 }).lean().exec();
        return faqs.map((faq) => ({
            id: faq._id.toString(),
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            userType: faq.userType,
            order: faq.order,
        }));
    }

    async createFaq(data: FaqCreateRequestDto): Promise<HomeFaqSnapshot> {
        const faq = await this.faqModel.create(data);
        return {
            id: faq._id.toString(),
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            userType: faq.userType,
            order: faq.order,
        };
    }

    async updateFaq(faqId: string, data: FaqUpdateRequestDto): Promise<HomeFaqSnapshot | null> {
        const faq = await this.faqModel.findByIdAndUpdate(faqId, data, { new: true }).lean().exec();
        if (!faq) {
            return null;
        }

        return {
            id: faq._id.toString(),
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            userType: faq.userType,
            order: faq.order,
        };
    }

    async deleteFaq(faqId: string): Promise<boolean> {
        const result = await this.faqModel.findByIdAndDelete(faqId).exec();
        return !!result;
    }

    private toBannerSnapshot(banner: any): HomeBannerSnapshot {
        return {
            id: banner._id.toString(),
            desktopImageFileName: banner.desktopImageFileName,
            mobileImageFileName: banner.mobileImageFileName,
            imageFileName: banner.imageFileName,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
            targetAudience: banner.targetAudience || [],
        };
    }
}
