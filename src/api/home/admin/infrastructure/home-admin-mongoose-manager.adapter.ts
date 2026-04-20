import { Injectable } from '@nestjs/common';

import { BannerDocument } from '../../../../schema/banner.schema';
import { FaqDocument } from '../../../../schema/faq.schema';
import { HomeAdminManagerPort } from '../application/ports/home-admin-manager.port';
import { HomeBannerSnapshot, HomeFaqSnapshot } from '../../application/ports/home-content-reader.port';
import { BannerRepository } from '../../repository/banner.repository';
import { FaqRepository } from '../../repository/faq.repository';
import type {
    HomeBannerCommand,
    HomeBannerUpdateCommand,
    HomeFaqCommand,
    HomeFaqUpdateCommand,
} from '../application/types/home-admin-command.type';

@Injectable()
export class HomeAdminMongooseManagerAdapter implements HomeAdminManagerPort {
    constructor(
        private readonly bannerRepository: BannerRepository,
        private readonly faqRepository: FaqRepository,
    ) {}

    async readAllBanners(): Promise<HomeBannerSnapshot[]> {
        const banners = await this.bannerRepository.findAllOrdered();
        return banners.map((banner) => this.toBannerSnapshot(banner));
    }

    async createBanner(data: HomeBannerCommand): Promise<HomeBannerSnapshot> {
        const banner = await this.bannerRepository.create(data);
        return this.toBannerSnapshot(banner);
    }

    async updateBanner(bannerId: string, data: HomeBannerUpdateCommand): Promise<HomeBannerSnapshot | null> {
        const banner = await this.bannerRepository.update(bannerId, data);
        return banner ? this.toBannerSnapshot(banner) : null;
    }

    async deleteBanner(bannerId: string): Promise<boolean> {
        return this.bannerRepository.deleteById(bannerId);
    }

    async readAllFaqs(): Promise<HomeFaqSnapshot[]> {
        const faqs = await this.faqRepository.findAllOrdered();
        return faqs.map((faq) => this.toFaqSnapshot(faq));
    }

    async createFaq(data: HomeFaqCommand): Promise<HomeFaqSnapshot> {
        const faq = await this.faqRepository.create(data);
        return this.toFaqSnapshot(faq);
    }

    async updateFaq(faqId: string, data: HomeFaqUpdateCommand): Promise<HomeFaqSnapshot | null> {
        const faq = await this.faqRepository.update(faqId, data);
        if (!faq) {
            return null;
        }

        return this.toFaqSnapshot(faq);
    }

    async deleteFaq(faqId: string): Promise<boolean> {
        return this.faqRepository.deleteById(faqId);
    }

    private toBannerSnapshot(banner: BannerDocument): HomeBannerSnapshot {
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

    private toFaqSnapshot(faq: FaqDocument): HomeFaqSnapshot {
        return {
            id: faq._id.toString(),
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            userType: faq.userType,
            order: faq.order,
        };
    }
}
