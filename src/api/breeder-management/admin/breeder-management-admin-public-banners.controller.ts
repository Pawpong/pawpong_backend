import { Get, Inject } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import type {
    GetActiveCounselBannersQueryPort,
    GetActiveProfileBannersQueryPort,
} from './application/ports/breeder-management-public-banner-query.port';
import {
    GET_ACTIVE_COUNSEL_BANNERS_QUERY,
    GET_ACTIVE_PROFILE_BANNERS_QUERY,
} from './application/tokens/breeder-management-public-banner-query.token';
import { BreederManagementAdminPublicController } from './decorator/breeder-management-admin-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';
import { CounselBannerResponseDto } from './dto/response/counsel-banner-response.dto';
import { ProfileBannerResponseDto } from './dto/response/profile-banner-response.dto';
import { ApiGetActiveCounselBannersAdminEndpoint, ApiGetActiveProfileBannersAdminEndpoint } from './swagger';

@BreederManagementAdminPublicController()
export class BreederManagementAdminPublicBannersController {
    constructor(
        @Inject(GET_ACTIVE_PROFILE_BANNERS_QUERY)
        private readonly getActiveProfileBannersQuery: GetActiveProfileBannersQueryPort,
        @Inject(GET_ACTIVE_COUNSEL_BANNERS_QUERY)
        private readonly getActiveCounselBannersQuery: GetActiveCounselBannersQueryPort,
    ) {}

    @Get('profile-banners/active')
    @ApiGetActiveProfileBannersAdminEndpoint()
    async getActiveProfileBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersQuery.execute();
        return ApiResponseDto.success(banners, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.activeProfileBannerListRetrieved);
    }

    @Get('counsel-banners/active')
    @ApiGetActiveCounselBannersAdminEndpoint()
    async getActiveCounselBanners(): Promise<ApiResponseDto<CounselBannerResponseDto[]>> {
        const banners = await this.getActiveCounselBannersQuery.execute();
        return ApiResponseDto.success(banners, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.activeCounselBannerListRetrieved);
    }
}
