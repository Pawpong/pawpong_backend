import { Get, HttpCode, HttpStatus } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetActiveProfileBannersUseCase } from '../breeder-management/admin/application/use-cases/get-active-profile-banners.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { ProfileBannerResponseDto } from '../breeder-management/admin/dto/response/profile-banner-response.dto';
import { ApiGetLoginBannersEndpoint, ApiGetRegisterBannersEndpoint } from './swagger';

@AuthPublicController()
export class AuthBannerController {
    constructor(private readonly getActiveProfileBannersUseCase: GetActiveProfileBannersUseCase) {}

    @Get('login-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetLoginBannersEndpoint()
    async getLoginBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersUseCase.execute('login');
        return ApiResponseDto.success(banners, '로그인 페이지 배너가 조회되었습니다.');
    }

    @Get('register-banners')
    @HttpCode(HttpStatus.OK)
    @ApiGetRegisterBannersEndpoint()
    async getRegisterBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersUseCase.execute('signup');
        return ApiResponseDto.success(banners, '회원가입 페이지 배너가 조회되었습니다.');
    }
}
