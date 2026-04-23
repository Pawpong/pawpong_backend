import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { CreateProfileBannerUseCase } from './application/use-cases/create-profile-banner.use-case';
import { DeleteProfileBannerUseCase } from './application/use-cases/delete-profile-banner.use-case';
import { GetAllProfileBannersUseCase } from './application/use-cases/get-all-profile-banners.use-case';
import { UpdateProfileBannerUseCase } from './application/use-cases/update-profile-banner.use-case';
import { BreederManagementAdminProtectedController } from './decorator/breeder-management-admin-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';
import { ProfileBannerCreateRequestDto } from './dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from './dto/request/profile-banner-update-request.dto';
import { ProfileBannerResponseDto } from './dto/response/profile-banner-response.dto';
import {
    ApiCreateProfileBannerAdminEndpoint,
    ApiDeleteProfileBannerAdminEndpoint,
    ApiGetAllProfileBannersAdminEndpoint,
    ApiUpdateProfileBannerAdminEndpoint,
} from './swagger';

@BreederManagementAdminProtectedController()
export class BreederManagementAdminProfileBannersController {
    constructor(
        private readonly getAllProfileBannersUseCase: GetAllProfileBannersUseCase,
        private readonly createProfileBannerUseCase: CreateProfileBannerUseCase,
        private readonly updateProfileBannerUseCase: UpdateProfileBannerUseCase,
        private readonly deleteProfileBannerUseCase: DeleteProfileBannerUseCase,
    ) {}

    @Get('profile-banners')
    @ApiGetAllProfileBannersAdminEndpoint()
    async getAllProfileBanners(): Promise<ApiResponseDto<ProfileBannerResponseDto[]>> {
        const banners = await this.getAllProfileBannersUseCase.execute();
        return ApiResponseDto.success(banners, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileBannerListRetrieved);
    }

    @Post('profile-banner')
    @ApiCreateProfileBannerAdminEndpoint()
    async createProfileBanner(
        @Body() data: ProfileBannerCreateRequestDto,
    ): Promise<ApiResponseDto<ProfileBannerResponseDto>> {
        const banner = await this.createProfileBannerUseCase.execute(data);
        return ApiResponseDto.success(banner, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileBannerCreated);
    }

    @Put('profile-banner/:bannerId')
    @ApiUpdateProfileBannerAdminEndpoint()
    async updateProfileBanner(
        @Param('bannerId', new MongoObjectIdPipe('배너', '올바르지 않은 배너 ID 형식입니다.')) bannerId: string,
        @Body() data: ProfileBannerUpdateRequestDto,
    ): Promise<ApiResponseDto<ProfileBannerResponseDto>> {
        const banner = await this.updateProfileBannerUseCase.execute(bannerId, data);
        return ApiResponseDto.success(banner, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileBannerUpdated);
    }

    @Delete('profile-banner/:bannerId')
    @ApiDeleteProfileBannerAdminEndpoint()
    async deleteProfileBanner(
        @Param('bannerId', new MongoObjectIdPipe('배너', '올바르지 않은 배너 ID 형식입니다.')) bannerId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteProfileBannerUseCase.execute(bannerId);
        return ApiResponseDto.success(null, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileBannerDeleted);
    }
}
