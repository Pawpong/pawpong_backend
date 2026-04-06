import { Injectable } from '@nestjs/common';

import { FaqCreateRequestDto } from './dto/request/faq-create-request.dto';
import { FaqUpdateRequestDto } from './dto/request/faq-update-request.dto';
import { BannerCreateRequestDto } from './dto/request/banner-create-request.dto';
import { BannerUpdateRequestDto } from './dto/request/banner-update-request.dto';
import { FaqResponseDto } from '../dto/response/faq-response.dto';
import { BannerResponseDto } from '../dto/response/banner-response.dto';
import { GetAllBannersUseCase } from './application/use-cases/get-all-banners.use-case';
import { CreateBannerUseCase } from './application/use-cases/create-banner.use-case';
import { UpdateBannerUseCase } from './application/use-cases/update-banner.use-case';
import { DeleteBannerUseCase } from './application/use-cases/delete-banner.use-case';
import { GetAllFaqsUseCase } from './application/use-cases/get-all-faqs.use-case';
import { CreateFaqUseCase } from './application/use-cases/create-faq.use-case';
import { UpdateFaqUseCase } from './application/use-cases/update-faq.use-case';
import { DeleteFaqUseCase } from './application/use-cases/delete-faq.use-case';

/**
 * 홈페이지 Admin 서비스
 * 배너 및 FAQ 관리 기능
 */
@Injectable()
export class HomeAdminService {
    constructor(
        private readonly getAllBannersUseCase: GetAllBannersUseCase,
        private readonly createBannerUseCase: CreateBannerUseCase,
        private readonly updateBannerUseCase: UpdateBannerUseCase,
        private readonly deleteBannerUseCase: DeleteBannerUseCase,
        private readonly getAllFaqsUseCase: GetAllFaqsUseCase,
        private readonly createFaqUseCase: CreateFaqUseCase,
        private readonly updateFaqUseCase: UpdateFaqUseCase,
        private readonly deleteFaqUseCase: DeleteFaqUseCase,
    ) {}

    async getAllBanners(): Promise<BannerResponseDto[]> {
        return this.getAllBannersUseCase.execute();
    }

    async createBanner(data: BannerCreateRequestDto): Promise<BannerResponseDto> {
        return this.createBannerUseCase.execute(data);
    }

    async updateBanner(bannerId: string, data: BannerUpdateRequestDto): Promise<BannerResponseDto> {
        return this.updateBannerUseCase.execute(bannerId, data);
    }

    async deleteBanner(bannerId: string): Promise<void> {
        return this.deleteBannerUseCase.execute(bannerId);
    }

    async getAllFaqs(): Promise<FaqResponseDto[]> {
        return this.getAllFaqsUseCase.execute();
    }

    async createFaq(data: FaqCreateRequestDto): Promise<FaqResponseDto> {
        return this.createFaqUseCase.execute(data);
    }

    async updateFaq(faqId: string, data: FaqUpdateRequestDto): Promise<FaqResponseDto> {
        return this.updateFaqUseCase.execute(faqId, data);
    }

    async deleteFaq(faqId: string): Promise<void> {
        return this.deleteFaqUseCase.execute(faqId);
    }
}
