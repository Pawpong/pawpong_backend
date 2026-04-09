import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllBannersUseCase } from './application/use-cases/get-all-banners.use-case';
import { HomeAdminProtectedController } from './decorator/home-admin-controller.decorator';
import { HomeResponseMessageService } from '../domain/services/home-response-message.service';
import { BannerResponseDto } from '../dto/response/banner-response.dto';
import { ApiGetAllBannersAdminEndpoint } from './swagger';

@HomeAdminProtectedController()
export class HomeAdminBannersQueryController {
    constructor(
        private readonly getAllBannersUseCase: GetAllBannersUseCase,
        private readonly homeResponseMessageService: HomeResponseMessageService,
    ) {}

    @Get('banners')
    @ApiGetAllBannersAdminEndpoint()
    async getAllBanners(): Promise<ApiResponseDto<BannerResponseDto[]>> {
        const banners = await this.getAllBannersUseCase.execute();
        return ApiResponseDto.success(banners, this.homeResponseMessageService.bannersRetrieved());
    }
}
