import { Injectable } from '@nestjs/common';

import { FaqResponseDto } from './dto/response/faq-response.dto';
import { BannerResponseDto } from './dto/response/banner-response.dto';
import { GetActiveBannersUseCase } from './application/use-cases/get-active-banners.use-case';
import { GetFaqsUseCase } from './application/use-cases/get-faqs.use-case';
import { GetAvailablePetsUseCase } from './application/use-cases/get-available-pets.use-case';

/**
 * 홈페이지 서비스
 * 배너, FAQ 등 홈페이지 공개 API
 */
@Injectable()
export class HomeService {
    constructor(
        private readonly getActiveBannersUseCase: GetActiveBannersUseCase,
        private readonly getFaqsUseCase: GetFaqsUseCase,
        private readonly getAvailablePetsUseCase: GetAvailablePetsUseCase,
    ) {}

    async getActiveBanners(): Promise<BannerResponseDto[]> {
        return this.getActiveBannersUseCase.execute();
    }

    async getAdopterFaqs(): Promise<FaqResponseDto[]> {
        return this.getFaqsUseCase.execute('adopter');
    }

    async getBreederFaqs(): Promise<FaqResponseDto[]> {
        return this.getFaqsUseCase.execute('breeder');
    }

    async getAvailablePets(limit: number = 10, isAuthenticated: boolean = false): Promise<any[]> {
        return this.getAvailablePetsUseCase.execute(limit, isAuthenticated);
    }
}
