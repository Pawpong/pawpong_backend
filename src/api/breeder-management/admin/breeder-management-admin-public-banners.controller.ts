import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetActiveCounselBannersUseCase } from './application/use-cases/get-active-counsel-banners.use-case';
import { GetActiveProfileBannersUseCase } from './application/use-cases/get-active-profile-banners.use-case';
import { BreederManagementAdminPublicController } from './decorator/breeder-management-admin-controller.decorator';
import { CounselBannerResponseDto } from './dto/response/counsel-banner-response.dto';
import { ProfileBannerResponseDto } from './dto/response/profile-banner-response.dto';
import { ApiGetActiveCounselBannersAdminEndpoint, ApiGetActiveProfileBannersAdminEndpoint } from './swagger';

@BreederManagementAdminPublicController()
export class BreederManagementAdminPublicBannersController {
    constructor(
        private readonly getActiveProfileBannersUseCase: GetActiveProfileBannersUseCase,
        private readonly getActiveCounselBannersUseCase: GetActiveCounselBannersUseCase,
    ) {}

    @Get('profile-banners/active')
    @ApiGetActiveProfileBannersAdminEndpoint()
    async getActiveProfileBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersUseCase.execute();
        return ApiResponseDto.success(banners, '활성화된 프로필 배너가 조회되었습니다.');
    }

    @Get('counsel-banners/active')
    @ApiGetActiveCounselBannersAdminEndpoint()
    async getActiveCounselBanners(): Promise<ApiResponseDto<CounselBannerResponseDto[]>> {
        const banners = await this.getActiveCounselBannersUseCase.execute();
        return ApiResponseDto.success(banners, '활성화된 상담 배너가 조회되었습니다.');
    }
}
