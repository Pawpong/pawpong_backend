import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllBannersUseCase } from './application/use-cases/get-all-banners.use-case';
import { HomeAdminProtectedController } from './decorator/home-admin-controller.decorator';
import { HomeBannerQueryResponseMessageService } from '../domain/services/home-banner-query-response-message.service';
import { BannerResponseDto } from '../dto/response/banner-response.dto';
import { ApiGetAllBannersAdminEndpoint } from './swagger';

@HomeAdminProtectedController()
export class HomeAdminBannersQueryController {
    constructor(
        private readonly getAllBannersUseCase: GetAllBannersUseCase,
        private readonly homeBannerQueryResponseMessageService: HomeBannerQueryResponseMessageService,
    ) {}

    @Get('banners')
    @ApiGetAllBannersAdminEndpoint()
    async getAllBanners(): Promise<ApiResponseDto<BannerResponseDto[]>> {
        const banners = await this.getAllBannersUseCase.execute();
        return ApiResponseDto.success(banners, this.homeBannerQueryResponseMessageService.bannersRetrieved());
    }
}
