import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    UseGuards,
    Put,
} from '@nestjs/common';

import { Public } from '../../../common/decorator/public.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';

import { ProfileBannerCreateRequestDto } from './dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from './dto/request/profile-banner-update-request.dto';
import { ProfileBannerResponseDto } from './dto/response/profile-banner-response.dto';
import { CounselBannerCreateRequestDto } from './dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from './dto/request/counsel-banner-update-request.dto';
import { CounselBannerResponseDto } from './dto/response/counsel-banner-response.dto';
import { CreateCounselBannerUseCase } from './application/use-cases/create-counsel-banner.use-case';
import { CreateProfileBannerUseCase } from './application/use-cases/create-profile-banner.use-case';
import { DeleteCounselBannerUseCase } from './application/use-cases/delete-counsel-banner.use-case';
import { DeleteProfileBannerUseCase } from './application/use-cases/delete-profile-banner.use-case';
import { GetActiveCounselBannersUseCase } from './application/use-cases/get-active-counsel-banners.use-case';
import { GetActiveProfileBannersUseCase } from './application/use-cases/get-active-profile-banners.use-case';
import { GetAllCounselBannersUseCase } from './application/use-cases/get-all-counsel-banners.use-case';
import { GetAllProfileBannersUseCase } from './application/use-cases/get-all-profile-banners.use-case';
import { UpdateCounselBannerUseCase } from './application/use-cases/update-counsel-banner.use-case';
import { UpdateProfileBannerUseCase } from './application/use-cases/update-profile-banner.use-case';
import {
    ApiBreederManagementAdminController,
    ApiCreateCounselBannerAdminEndpoint,
    ApiCreateProfileBannerAdminEndpoint,
    ApiDeleteCounselBannerAdminEndpoint,
    ApiDeleteProfileBannerAdminEndpoint,
    ApiGetActiveCounselBannersAdminEndpoint,
    ApiGetActiveProfileBannersAdminEndpoint,
    ApiGetAllCounselBannersAdminEndpoint,
    ApiGetAllProfileBannersAdminEndpoint,
    ApiUpdateCounselBannerAdminEndpoint,
    ApiUpdateProfileBannerAdminEndpoint,
} from './swagger';

@ApiBreederManagementAdminController()
@Controller('breeder-management-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreederManagementAdminController {
    constructor(
        private readonly getAllProfileBannersUseCase: GetAllProfileBannersUseCase,
        private readonly getActiveProfileBannersUseCase: GetActiveProfileBannersUseCase,
        private readonly createProfileBannerUseCase: CreateProfileBannerUseCase,
        private readonly updateProfileBannerUseCase: UpdateProfileBannerUseCase,
        private readonly deleteProfileBannerUseCase: DeleteProfileBannerUseCase,
        private readonly getAllCounselBannersUseCase: GetAllCounselBannersUseCase,
        private readonly getActiveCounselBannersUseCase: GetActiveCounselBannersUseCase,
        private readonly createCounselBannerUseCase: CreateCounselBannerUseCase,
        private readonly updateCounselBannerUseCase: UpdateCounselBannerUseCase,
        private readonly deleteCounselBannerUseCase: DeleteCounselBannerUseCase,
    ) {}

    @Get('profile-banners')
    @ApiGetAllProfileBannersAdminEndpoint()
    async getAllProfileBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getAllProfileBannersUseCase.execute();
        return ApiResponseDto.success(banners, '프로필 배너 목록이 조회되었습니다.');
    }

    @Public()
    @Get('profile-banners/active')
    @ApiGetActiveProfileBannersAdminEndpoint()
    async getActiveProfileBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getActiveProfileBannersUseCase.execute();
        return ApiResponseDto.success(banners, '활성화된 프로필 배너가 조회되었습니다.');
    }

    @Post('profile-banner')
    @ApiCreateProfileBannerAdminEndpoint()
    async createProfileBanner(
        @Body() data: ProfileBannerCreateRequestDto,
    ): Promise<ApiResponseDto<ProfileBannerResponseDto>> {
        const banner = await this.createProfileBannerUseCase.execute(data);
        return ApiResponseDto.success(banner, '프로필 배너가 생성되었습니다.');
    }

    @Put('profile-banner/:bannerId')
    @ApiUpdateProfileBannerAdminEndpoint()
    async updateProfileBanner(
        @Param('bannerId') bannerId: string,
        @Body() data: ProfileBannerUpdateRequestDto,
    ): Promise<ApiResponseDto<ProfileBannerResponseDto>> {
        const banner = await this.updateProfileBannerUseCase.execute(bannerId, data);
        return ApiResponseDto.success(banner, '프로필 배너가 수정되었습니다.');
    }

    @Delete('profile-banner/:bannerId')
    @ApiDeleteProfileBannerAdminEndpoint()
    async deleteProfileBanner(@Param('bannerId') bannerId: string): Promise<ApiResponseDto<null>> {
        await this.deleteProfileBannerUseCase.execute(bannerId);
        return ApiResponseDto.success(null, '프로필 배너가 삭제되었습니다.');
    }

    @Get('counsel-banners')
    @ApiGetAllCounselBannersAdminEndpoint()
    async getAllCounselBanners(): Promise<ApiResponseDto<CounselBannerResponseDto[]>> {
        const banners = await this.getAllCounselBannersUseCase.execute();
        return ApiResponseDto.success(banners, '상담 배너 목록이 조회되었습니다.');
    }

    @Public()
    @Get('counsel-banners/active')
    @ApiGetActiveCounselBannersAdminEndpoint()
    async getActiveCounselBanners(): Promise<ApiResponseDto<CounselBannerResponseDto[]>> {
        const banners = await this.getActiveCounselBannersUseCase.execute();
        return ApiResponseDto.success(banners, '활성화된 상담 배너가 조회되었습니다.');
    }

    @Post('counsel-banner')
    @ApiCreateCounselBannerAdminEndpoint()
    async createCounselBanner(
        @Body() data: CounselBannerCreateRequestDto,
    ): Promise<ApiResponseDto<CounselBannerResponseDto>> {
        const banner = await this.createCounselBannerUseCase.execute(data);
        return ApiResponseDto.success(banner, '상담 배너가 생성되었습니다.');
    }

    @Put('counsel-banner/:bannerId')
    @ApiUpdateCounselBannerAdminEndpoint()
    async updateCounselBanner(
        @Param('bannerId') bannerId: string,
        @Body() data: CounselBannerUpdateRequestDto,
    ): Promise<ApiResponseDto<CounselBannerResponseDto>> {
        const banner = await this.updateCounselBannerUseCase.execute(bannerId, data);
        return ApiResponseDto.success(banner, '상담 배너가 수정되었습니다.');
    }

    @Delete('counsel-banner/:bannerId')
    @ApiDeleteCounselBannerAdminEndpoint()
    async deleteCounselBanner(@Param('bannerId') bannerId: string): Promise<ApiResponseDto<null>> {
        await this.deleteCounselBannerUseCase.execute(bannerId);
        return ApiResponseDto.success(null, '상담 배너가 삭제되었습니다.');
    }
}
