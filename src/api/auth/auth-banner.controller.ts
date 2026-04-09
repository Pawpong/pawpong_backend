import { Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthBannerResponseMessageService } from './domain/services/auth-banner-response-message.service';
import { ProfileBannerResponseDto } from '../breeder-management/admin/dto/response/profile-banner-response.dto';
import {
    GET_ACTIVE_PROFILE_BANNERS_QUERY,
    type GetActiveProfileBannersQueryPort,
} from '../breeder-management/admin/application/ports/breeder-management-public-banner-query.port';
import { ApiGetLoginBannersEndpoint, ApiGetRegisterBannersEndpoint } from './swagger';

@AuthPublicController()
export class AuthBannerController {
    constructor(
        @Inject(GET_ACTIVE_PROFILE_BANNERS_QUERY)
        private readonly getActiveProfileBannersQuery: GetActiveProfileBannersQueryPort,
        private readonly authBannerResponseMessageService: AuthBannerResponseMessageService,
    ) {}

    @Get('login-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetLoginBannersEndpoint()
    async getLoginBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersQuery.execute('login');
        return ApiResponseDto.success(banners, this.authBannerResponseMessageService.getBannerListed('login'));
    }

    @Get('register-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetRegisterBannersEndpoint()
    async getRegisterBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersQuery.execute('signup');
        return ApiResponseDto.success(banners, this.authBannerResponseMessageService.getBannerListed('signup'));
    }
}
