import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StorageService } from '../../common/storage/storage.service';

import { Faq, FaqDocument } from '../../schema/faq.schema';
import { Banner, BannerDocument } from '../../schema/banner.schema';
import { Breeder, BreederDocument } from '../../schema/breeder.schema';
import { AvailablePet, AvailablePetDocument } from '../../schema/available-pet.schema';

import { FaqResponseDto } from './dto/response/faq-response.dto';
import { BannerResponseDto } from './dto/response/banner-response.dto';

/**
 * 홈페이지 서비스
 * 배너, FAQ 등 홈페이지 공개 API
 */
@Injectable()
export class HomeService {
    private readonly logger = new Logger(HomeService.name);

    constructor(
        @InjectModel(Faq.name) private faqModel: Model<FaqDocument>,
        @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
        @InjectModel(AvailablePet.name) private availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,

        private readonly storageService: StorageService,
    ) {}

    /**
     * 활성화된 배너 목록 조회
     * 정렬 순서대로 반환
     */
    async getActiveBanners(): Promise<BannerResponseDto[]> {
        this.logger.log('[getActiveBanners] 배너 목록 조회 시작');

        const banners = await this.bannerModel.find({ isActive: true }).sort({ order: 1 }).lean().exec();

        this.logger.log(`[getActiveBanners] ${banners.length}개의 배너 조회 완료`);

        return banners.map((banner) => {
            // 레거시 데이터 처리: imageFileName이 있지만 새 필드가 없는 경우 폴백
            const desktopFileName = banner.desktopImageFileName || banner.imageFileName;
            const mobileFileName = banner.mobileImageFileName || banner.imageFileName;

            return {
                bannerId: banner._id.toString(),
                desktopImageUrl: desktopFileName ? this.storageService.generateSignedUrl(desktopFileName, 60 * 24) : '', // 24시간 유효
                mobileImageUrl: mobileFileName ? this.storageService.generateSignedUrl(mobileFileName, 60 * 24) : '', // 24시간 유효
                desktopImageFileName: desktopFileName || '',
                mobileImageFileName: mobileFileName || '',
                linkType: banner.linkType,
                linkUrl: banner.linkUrl,
                title: banner.title,
                description: banner.description,
                order: banner.order,
                isActive: banner.isActive !== false, // 기본값 true
                targetAudience: banner.targetAudience || [], // 표시 대상
            };
        });
    }

    /**
     * 일반 사용자용 FAQ 목록 조회
     * userType이 'adopter' 또는 'both'인 FAQ만 반환
     */
    async getAdopterFaqs(): Promise<FaqResponseDto[]> {
        this.logger.log('[getAdopterFaqs] 일반 사용자 FAQ 조회 시작');

        const faqs = await this.faqModel
            .find({
                isActive: true,
                userType: { $in: ['adopter', 'both'] },
            })
            .sort({ order: 1 })
            .lean()
            .exec();

        this.logger.log(`[getAdopterFaqs] ${faqs.length}개의 FAQ 조회 완료`);

        return faqs.map((faq) => ({
            faqId: faq._id.toString(),
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            userType: faq.userType,
            order: faq.order,
        }));
    }

    /**
     * 브리더용 FAQ 목록 조회
     * userType이 'breeder' 또는 'both'인 FAQ만 반환
     */
    async getBreederFaqs(): Promise<FaqResponseDto[]> {
        this.logger.log('[getBreederFaqs] 브리더 FAQ 조회 시작');

        const faqs = await this.faqModel
            .find({
                isActive: true,
                userType: { $in: ['breeder', 'both'] },
            })
            .sort({ order: 1 })
            .lean()
            .exec();

        this.logger.log(`[getBreederFaqs] ${faqs.length}개의 FAQ 조회 완료`);

        return faqs.map((faq) => ({
            faqId: faq._id.toString(),
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            userType: faq.userType,
            order: faq.order,
        }));
    }

    /**
     * 분양 가능한 반려동물 목록 조회
     * AvailablePet 컬렉션에서 직접 조회
     * 탈퇴/정지된 브리더의 개체는 제외
     * @param limit 조회 개수 (기본: 10, 최대: 50)
     */
    async getAvailablePets(limit: number = 10): Promise<any[]> {
        // 최대 조회 개수 제한 (최대 50개)
        const validLimit = Math.min(limit, 50);
        this.logger.log(`[getAvailablePets] 분양 가능한 반려동물 ${validLimit}개 조회 시작`);

        // 활성 상태의 브리더 ID 목록 조회 (탈퇴/정지/테스트 브리더 제외)
        const activeBreeders = await this.breederModel
            .find({ accountStatus: 'active', isTestAccount: { $ne: true } })
            .select('_id')
            .lean()
            .exec();
        const activeBreederIds = activeBreeders.map((b) => b._id);

        this.logger.log(`[getAvailablePets] 활성 브리더 ${activeBreederIds.length}명 확인`);

        // AvailablePet 컬렉션에서 분양 가능한 개체 조회 (활성 브리더만)
        const pets = await this.availablePetModel
            .find({
                status: 'available',
                isActive: true,
                breederId: { $in: activeBreederIds },
            })
            .populate('breederId', 'name profile')
            .limit(validLimit)
            .sort({ createdAt: -1 }) // 최신순
            .lean()
            .exec();

        this.logger.log(`[getAvailablePets] ${pets.length}개의 분양 가능 반려동물 조회 완료`);

        // 응답 DTO로 변환
        const result = pets.map((pet: any) => {
            const breeder = pet.breederId || {};
            return {
                petId: pet._id.toString(),
                name: pet.name,
                breed: pet.breed,
                breederId: breeder._id ? breeder._id.toString() : '',
                breederName: breeder.name || '브리더 정보 없음',
                price: pet.price || 0,
                mainPhoto:
                    pet.photos && pet.photos.length > 0
                        ? this.storageService.generateSignedUrl(pet.photos[0], 60)
                        : 'https://via.placeholder.com/300',
                ageInMonths: this.calculateAgeInMonths(pet.birthDate),
                location: {
                    city: breeder.profile?.location?.city || '',
                    district: breeder.profile?.location?.district || '',
                },
            };
        });

        this.logger.log(`[getAvailablePets] ${result.length}개의 분양 가능 반려동물 반환`);

        return result;
    }

    /**
     * 생년월일로부터 개월수 계산
     */
    private calculateAgeInMonths(birthDate: Date | string): number {
        if (!birthDate) return 0;
        const birth = new Date(birthDate);
        const now = new Date();
        const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        return Math.max(0, months);
    }
}
