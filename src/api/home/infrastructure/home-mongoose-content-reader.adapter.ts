import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import { Banner, BannerDocument } from '../../../schema/banner.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { Faq, FaqDocument } from '../../../schema/faq.schema';
import {
    HomeBannerSnapshot,
    HomeContentReaderPort,
    HomeFaqAudience,
    HomeFaqSnapshot,
    HomeAvailablePetSnapshot,
} from '../application/ports/home-content-reader.port';

@Injectable()
export class HomeMongooseContentReaderAdapter implements HomeContentReaderPort {
    constructor(
        @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
        @InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>,
        @InjectModel(AvailablePet.name) private readonly availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async readActiveBanners(): Promise<HomeBannerSnapshot[]> {
        const banners = await this.bannerModel.find({ isActive: true }).sort({ order: 1 }).lean().exec();

        return banners.map((banner) => ({
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
        }));
    }

    async readFaqsFor(audience: HomeFaqAudience): Promise<HomeFaqSnapshot[]> {
        const userTypes = audience === 'breeder' ? ['breeder', 'both'] : ['adopter', 'both'];
        const faqs = await this.faqModel
            .find({
                isActive: true,
                userType: { $in: userTypes },
            })
            .sort({ order: 1 })
            .lean()
            .exec();

        return faqs.map((faq) => ({
            id: faq._id.toString(),
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            userType: faq.userType,
            order: faq.order,
        }));
    }

    async readAvailablePets(limit: number): Promise<HomeAvailablePetSnapshot[]> {
        const activeBreeders = await this.breederModel
            .find({ accountStatus: 'active', isTestAccount: { $ne: true } })
            .select('_id')
            .lean()
            .exec();

        const activeBreederIds = activeBreeders.map((breeder) => breeder._id);
        const pets = await this.availablePetModel
            .find({
                status: 'available',
                isActive: true,
                breederId: { $in: activeBreederIds },
            })
            .populate('breederId', 'name profile')
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        return pets.map((pet: any) => ({
            id: pet._id.toString(),
            name: pet.name,
            breed: pet.breed,
            price: pet.price || 0,
            photos: pet.photos || [],
            birthDate: pet.birthDate || null,
            breederId: pet.breederId?._id?.toString() || '',
            breederName: pet.breederId?.name || '브리더 정보 없음',
            breederCity: pet.breederId?.profile?.location?.city || '',
            breederDistrict: pet.breederId?.profile?.location?.district || '',
        }));
    }
}
