import { Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from './constants/auth-response-messages';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { ProfileBannerResponseDto } from '../breeder-management/admin/dto/response/profile-banner-response.dto';
import type { GetActiveProfileBannersQueryPort } from '../breeder-management/admin/application/ports/breeder-management-public-banner-query.port';
import { GET_ACTIVE_PROFILE_BANNERS_QUERY } from '../breeder-management/admin/application/tokens/breeder-management-public-banner-query.token';
import { ApiGetLoginBannersEndpoint, ApiGetRegisterBannersEndpoint } from './swagger';

@AuthPublicController()
export class AuthBannerController {
    constructor(
        @Inject(GET_ACTIVE_PROFILE_BANNERS_QUERY)
        private readonly getActiveProfileBannersQuery: GetActiveProfileBannersQueryPort,
    ) {}

    @Get('login-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetLoginBannersEndpoint()
    async getLoginBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersQuery.execute('login');
        return ApiResponseDto.success(banners, AUTH_RESPONSE_MESSAGE_EXAMPLES.loginBannersListed);
    }

    @Get('register-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetRegisterBannersEndpoint()
    async getRegisterBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersQuery.execute('signup');
        return ApiResponseDto.success(banners, AUTH_RESPONSE_MESSAGE_EXAMPLES.registerBannersListed);
    }
}
