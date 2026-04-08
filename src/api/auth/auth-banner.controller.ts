import { Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
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
    ) {}

    @Get('login-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetLoginBannersEndpoint()
    async getLoginBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersQuery.execute('login');
        return ApiResponseDto.success(banners, '로그인 페이지 배너가 조회되었습니다.');
    }

    @Get('register-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetRegisterBannersEndpoint()
    async getRegisterBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersQuery.execute('signup');
        return ApiResponseDto.success(banners, '회원가입 페이지 배너가 조회되었습니다.');
    }
}
