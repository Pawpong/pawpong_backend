import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { FaqResponseDto } from './dto/response/faq-response.dto';
import { BannerResponseDto } from './dto/response/banner-response.dto';
import { AvailablePetResponseDto } from './dto/response/available-pet-response.dto';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guard/optional-jwt-auth.guard';
import { GetActiveBannersUseCase } from './application/use-cases/get-active-banners.use-case';
import { GetFaqsUseCase } from './application/use-cases/get-faqs.use-case';
import { GetAvailablePetsUseCase } from './application/use-cases/get-available-pets.use-case';
import { ApiGetHomeAvailablePetsEndpoint, ApiGetHomeBannersEndpoint, ApiGetHomeFaqsEndpoint, ApiHomeController } from './swagger';

/**
 * 홈페이지 공개 API 컨트롤러
 */
@ApiHomeController()
@Controller('home')
export class HomeController {
    constructor(
        private readonly getActiveBannersUseCase: GetActiveBannersUseCase,
        private readonly getFaqsUseCase: GetFaqsUseCase,
        private readonly getAvailablePetsUseCase: GetAvailablePetsUseCase,
    ) {}

    /**
     * 활성화된 배너 목록 조회
     * GET /api/home/banners
     */
    @Get('banners')
    @ApiGetHomeBannersEndpoint()
    async getBanners(): Promise<ApiResponseDto<BannerResponseDto[]>> {
        const banners = await this.getActiveBannersUseCase.execute();
        return ApiResponseDto.success(banners, '배너 목록이 조회되었습니다.');
    }

    /**
     * FAQ 목록 조회 (쿼리 파라미터 방식)
     * GET /api/home/faqs?userType=adopter
     * GET /api/home/faqs?userType=breeder
     */
    @Get('faqs')
    @ApiGetHomeFaqsEndpoint()
    async getFaqs(@Query('userType') userType: string = 'adopter'): Promise<ApiResponseDto<FaqResponseDto[]>> {
        const faqs = await this.getFaqsUseCase.execute(userType);
        return ApiResponseDto.success(faqs, 'FAQ 목록이 조회되었습니다.');
    }

    /**
     * 분양 가능한 반려동물 목록 조회
     * GET /api/home/available-pets?limit=10
     */
    @Get('available-pets')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiGetHomeAvailablePetsEndpoint()
    async getAvailablePets(
        @Query('limit') limit: number = 10,
        @CurrentUser() user?: any,
    ): Promise<ApiResponseDto<AvailablePetResponseDto[]>> {
        const isAuthenticated = !!user?.userId;
        const pets = await this.getAvailablePetsUseCase.execute(limit, isAuthenticated);
        return ApiResponseDto.success(pets, '분양중인 아이들이 조회되었습니다.');
    }
}
