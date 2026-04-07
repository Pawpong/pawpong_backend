import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CreateCounselBannerUseCase } from './application/use-cases/create-counsel-banner.use-case';
import { DeleteCounselBannerUseCase } from './application/use-cases/delete-counsel-banner.use-case';
import { GetAllCounselBannersUseCase } from './application/use-cases/get-all-counsel-banners.use-case';
import { UpdateCounselBannerUseCase } from './application/use-cases/update-counsel-banner.use-case';
import { BreederManagementAdminProtectedController } from './decorator/breeder-management-admin-controller.decorator';
import { CounselBannerCreateRequestDto } from './dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from './dto/request/counsel-banner-update-request.dto';
import { CounselBannerResponseDto } from './dto/response/counsel-banner-response.dto';
import {
    ApiCreateCounselBannerAdminEndpoint,
    ApiDeleteCounselBannerAdminEndpoint,
    ApiGetAllCounselBannersAdminEndpoint,
    ApiUpdateCounselBannerAdminEndpoint,
} from './swagger';

@BreederManagementAdminProtectedController()
export class BreederManagementAdminCounselBannersController {
    constructor(
        private readonly getAllCounselBannersUseCase: GetAllCounselBannersUseCase,
        private readonly createCounselBannerUseCase: CreateCounselBannerUseCase,
        private readonly updateCounselBannerUseCase: UpdateCounselBannerUseCase,
        private readonly deleteCounselBannerUseCase: DeleteCounselBannerUseCase,
    ) {}

    @Get('counsel-banners')
    @ApiGetAllCounselBannersAdminEndpoint()
    async getAllCounselBanners(): Promise<ApiResponseDto<CounselBannerResponseDto[]>> {
        const banners = await this.getAllCounselBannersUseCase.execute();
        return ApiResponseDto.success(banners, '상담 배너 목록이 조회되었습니다.');
    }

    @Post('counsel-banner')
    @ApiCreateCounselBannerAdminEndpoint()
    async createCounselBanner(@Body() data: CounselBannerCreateRequestDto): Promise<ApiResponseDto<CounselBannerResponseDto>> {
        const banner = await this.createCounselBannerUseCase.execute(data);
        return ApiResponseDto.success(banner, '상담 배너가 생성되었습니다.');
    }

    @Put('counsel-banner/:bannerId')
    @ApiUpdateCounselBannerAdminEndpoint()
    async updateCounselBanner(
        @Param('bannerId') bannerId: string,
        @Body() data: CounselBannerUpdateRequestDto,
    ): Promise<ApiResponseDto<CounselBannerResponseDto>> {
        const banner = await this.updateCounselBannerUseCase.execute(bannerId, data);
        return ApiResponseDto.success(banner, '상담 배너가 수정되었습니다.');
    }

    @Delete('counsel-banner/:bannerId')
    @ApiDeleteCounselBannerAdminEndpoint()
    async deleteCounselBanner(@Param('bannerId') bannerId: string): Promise<ApiResponseDto<null>> {
        await this.deleteCounselBannerUseCase.execute(bannerId);
        return ApiResponseDto.success(null, '상담 배너가 삭제되었습니다.');
    }
}
