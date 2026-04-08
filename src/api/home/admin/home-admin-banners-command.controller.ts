import { Body, Delete, Param, Post, Put } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CreateBannerUseCase } from './application/use-cases/create-banner.use-case';
import { DeleteBannerUseCase } from './application/use-cases/delete-banner.use-case';
import { UpdateBannerUseCase } from './application/use-cases/update-banner.use-case';
import { HomeAdminProtectedController } from './decorator/home-admin-controller.decorator';
import { BannerCreateRequestDto } from './dto/request/banner-create-request.dto';
import { BannerUpdateRequestDto } from './dto/request/banner-update-request.dto';
import { BannerResponseDto } from '../dto/response/banner-response.dto';
import {
    ApiCreateBannerAdminEndpoint,
    ApiDeleteBannerAdminEndpoint,
    ApiUpdateBannerAdminEndpoint,
} from './swagger';

@HomeAdminProtectedController()
export class HomeAdminBannersCommandController {
    constructor(
        private readonly createBannerUseCase: CreateBannerUseCase,
        private readonly updateBannerUseCase: UpdateBannerUseCase,
        private readonly deleteBannerUseCase: DeleteBannerUseCase,
    ) {}

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
}
