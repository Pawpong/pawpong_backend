import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetActiveBannersUseCase } from './application/use-cases/get-active-banners.use-case';
import { HOME_RESPONSE_MESSAGE_EXAMPLES } from './constants/home-response-messages';
import { HomePublicController } from './decorator/home-controller.decorator';
import { BannerResponseDto } from './dto/response/banner-response.dto';
import { ApiGetHomeBannersEndpoint } from './swagger';

@HomePublicController()
export class HomeBannersController {
    constructor(private readonly getActiveBannersUseCase: GetActiveBannersUseCase) {}

    @Get('banners')
    @ApiGetHomeBannersEndpoint()
    async getBanners(): Promise<ApiResponseDto<BannerResponseDto[]>> {
        const banners = await this.getActiveBannersUseCase.execute();
        return ApiResponseDto.success(banners, HOME_RESPONSE_MESSAGE_EXAMPLES.bannersRetrieved);
    }
}
