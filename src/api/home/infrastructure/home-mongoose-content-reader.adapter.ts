import { Injectable } from '@nestjs/common';

import {
    HomeBannerSnapshot,
    HomeContentReaderPort,
    HomeFaqAudience,
    HomeFaqSnapshot,
    HomeAvailablePetSnapshot,
} from '../application/ports/home-content-reader.port';
import { AvailablePetRepository } from '../repository/available-pet.repository';
import { BannerRepository } from '../repository/banner.repository';
import { FaqRepository } from '../repository/faq.repository';

@Injectable()
export class HomeMongooseContentReaderAdapter implements HomeContentReaderPort {
    constructor(
        private readonly bannerRepository: BannerRepository,
        private readonly faqRepository: FaqRepository,
        private readonly availablePetRepository: AvailablePetRepository,
    ) {}

    async readActiveBanners(): Promise<HomeBannerSnapshot[]> {
        const banners = await this.bannerRepository.findActiveOrdered();

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
        const faqs = await this.faqRepository.findActiveForUserTypes(userTypes);

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
        const pets = await this.availablePetRepository.findHomeAvailablePets(limit);

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
