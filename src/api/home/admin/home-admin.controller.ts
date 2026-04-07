import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { BannerCreateRequestDto } from './dto/request/banner-create-request.dto';
import { BannerUpdateRequestDto } from './dto/request/banner-update-request.dto';
import { FaqCreateRequestDto } from './dto/request/faq-create-request.dto';
import { FaqUpdateRequestDto } from './dto/request/faq-update-request.dto';
import { BannerResponseDto } from '../dto/response/banner-response.dto';
import { FaqResponseDto } from '../dto/response/faq-response.dto';
import { GetAllBannersUseCase } from './application/use-cases/get-all-banners.use-case';
import { CreateBannerUseCase } from './application/use-cases/create-banner.use-case';
import { UpdateBannerUseCase } from './application/use-cases/update-banner.use-case';
import { DeleteBannerUseCase } from './application/use-cases/delete-banner.use-case';
import { GetAllFaqsUseCase } from './application/use-cases/get-all-faqs.use-case';
import { CreateFaqUseCase } from './application/use-cases/create-faq.use-case';
import { UpdateFaqUseCase } from './application/use-cases/update-faq.use-case';
import { DeleteFaqUseCase } from './application/use-cases/delete-faq.use-case';
import {
    ApiCreateBannerAdminEndpoint,
    ApiCreateFaqAdminEndpoint,
    ApiDeleteBannerAdminEndpoint,
    ApiDeleteFaqAdminEndpoint,
    ApiGetAllBannersAdminEndpoint,
    ApiGetAllFaqsAdminEndpoint,
    ApiHomeAdminController,
    ApiUpdateBannerAdminEndpoint,
    ApiUpdateFaqAdminEndpoint,
} from './swagger';

/**
 * 홈페이지 Admin 컨트롤러
 * 배너 및 FAQ 관리
 */
@ApiHomeAdminController()
@Controller('home-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class HomeAdminController {
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

    @Get('banners')
    @ApiGetAllBannersAdminEndpoint()
    async getAllBanners(): Promise<ApiResponseDto<BannerResponseDto[]>> {
        const banners = await this.getAllBannersUseCase.execute();
        return ApiResponseDto.success(banners, '배너 목록이 조회되었습니다.');
    }

    @Post('banner')
    @ApiCreateBannerAdminEndpoint()
    async createBanner(@Body() data: BannerCreateRequestDto): Promise<ApiResponseDto<BannerResponseDto>> {
        const banner = await this.createBannerUseCase.execute(data);
        return ApiResponseDto.success(banner, '배너가 생성되었습니다.');
    }

    @Put('banner/:bannerId')
    @ApiUpdateBannerAdminEndpoint()
    async updateBanner(
        @Param('bannerId') bannerId: string,
        @Body() data: BannerUpdateRequestDto,
    ): Promise<ApiResponseDto<BannerResponseDto>> {
        const banner = await this.updateBannerUseCase.execute(bannerId, data);
        return ApiResponseDto.success(banner, '배너가 수정되었습니다.');
    }

    @Delete('banner/:bannerId')
    @ApiDeleteBannerAdminEndpoint()
    async deleteBanner(@Param('bannerId') bannerId: string): Promise<ApiResponseDto<null>> {
        await this.deleteBannerUseCase.execute(bannerId);
        return ApiResponseDto.success(null, '배너가 삭제되었습니다.');
    }

    @Get('faqs')
    @ApiGetAllFaqsAdminEndpoint()
    async getAllFaqs(): Promise<ApiResponseDto<FaqResponseDto[]>> {
        const faqs = await this.getAllFaqsUseCase.execute();
        return ApiResponseDto.success(faqs, 'FAQ 목록이 조회되었습니다.');
    }

    @Post('faq')
    @ApiCreateFaqAdminEndpoint()
    async createFaq(@Body() data: FaqCreateRequestDto): Promise<ApiResponseDto<FaqResponseDto>> {
        const faq = await this.createFaqUseCase.execute(data);
        return ApiResponseDto.success(faq, 'FAQ가 생성되었습니다.');
    }

    @Put('faq/:faqId')
    @ApiUpdateFaqAdminEndpoint()
    async updateFaq(
        @Param('faqId') faqId: string,
        @Body() data: FaqUpdateRequestDto,
    ): Promise<ApiResponseDto<FaqResponseDto>> {
        const faq = await this.updateFaqUseCase.execute(faqId, data);
        return ApiResponseDto.success(faq, 'FAQ가 수정되었습니다.');
    }

    @Delete('faq/:faqId')
    @ApiDeleteFaqAdminEndpoint()
    async deleteFaq(@Param('faqId') faqId: string): Promise<ApiResponseDto<null>> {
        await this.deleteFaqUseCase.execute(faqId);
        return ApiResponseDto.success(null, 'FAQ가 삭제되었습니다.');
    }
}
