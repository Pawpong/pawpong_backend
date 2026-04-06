import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { FaqResponseDto } from './dto/response/faq-response.dto';
import { BannerResponseDto } from './dto/response/banner-response.dto';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guard/optional-jwt-auth.guard';
import { GetActiveBannersUseCase } from './application/use-cases/get-active-banners.use-case';
import { GetFaqsUseCase } from './application/use-cases/get-faqs.use-case';
import { GetAvailablePetsUseCase } from './application/use-cases/get-available-pets.use-case';

/**
 * 홈페이지 공개 API 컨트롤러
 */
@ApiTags('홈페이지')
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
    @ApiOperation({
        summary: '메인 배너 목록 조회',
        description: '홈페이지에 표시할 활성화된 배너 목록을 정렬 순서대로 반환합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '배너 목록 조회 성공',
        type: [BannerResponseDto],
    })
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
    @ApiOperation({
        summary: 'FAQ 목록 조회',
        description: '사용자 타입에 따른 FAQ 목록을 정렬 순서대로 반환합니다.',
    })
    @ApiQuery({
        name: 'userType',
        required: false,
        description: '사용자 타입 (adopter | breeder)',
        enum: ['adopter', 'breeder'],
    })
    @ApiResponse({
        status: 200,
        description: 'FAQ 목록 조회 성공',
        type: [FaqResponseDto],
    })
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
    @ApiOperation({
        summary: '분양 중인 아이들 조회',
        description:
            '홈페이지에 표시할 분양 가능한 반려동물 목록을 반환합니다. 비로그인 시 가격 정보는 제공되지 않습니다.',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        description: '조회 개수 (기본: 10, 최대: 50)',
        type: Number,
    })
    @ApiResponse({
        status: 200,
        description: '분양 가능한 반려동물 목록 조회 성공',
    })
    async getAvailablePets(
        @Query('limit') limit: number = 10,
        @CurrentUser() user?: any,
    ): Promise<ApiResponseDto<any[]>> {
        const isAuthenticated = !!user?.userId;
        const pets = await this.getAvailablePetsUseCase.execute(limit, isAuthenticated);
        return ApiResponseDto.success(pets, '분양중인 아이들이 조회되었습니다.');
    }
}
