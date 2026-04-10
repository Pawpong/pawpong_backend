import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { CreateCounselBannerUseCase } from './application/use-cases/create-counsel-banner.use-case';
import { DeleteCounselBannerUseCase } from './application/use-cases/delete-counsel-banner.use-case';
import { GetAllCounselBannersUseCase } from './application/use-cases/get-all-counsel-banners.use-case';
import { UpdateCounselBannerUseCase } from './application/use-cases/update-counsel-banner.use-case';
import { BreederManagementAdminProtectedController } from './decorator/breeder-management-admin-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';
import { CounselBannerCreateRequestDto } from './dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from './dto/request/counsel-banner-update-request.dto';
import { CounselBannerResponseDto } from './dto/response/counsel-banner-response.dto';
import {
    ApiCreateCounselBannerAdminEndpoint,
    ApiDeleteCounselBannerAdminEndpoint,
    ApiGetAllCounselBannersAdminEndpoint,
    ApiUpdateCounselBannerAdminEndpoint,
} from './swagger';

@BreederManagementAdminProtectedController()
export class BreederManagementAdminCounselBannersController {
    constructor(
        private readonly getAllCounselBannersUseCase: GetAllCounselBannersUseCase,
        private readonly createCounselBannerUseCase: CreateCounselBannerUseCase,
        private readonly updateCounselBannerUseCase: UpdateCounselBannerUseCase,
        private readonly deleteCounselBannerUseCase: DeleteCounselBannerUseCase,
    ) {}

    @Get('counsel-banners')
    @ApiGetAllCounselBannersAdminEndpoint()
    async getAllCounselBanners(): Promise<ApiResponseDto<CounselBannerResponseDto[]>> {
        const banners = await this.getAllCounselBannersUseCase.execute();
        return ApiResponseDto.success(banners, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.counselBannerListRetrieved);
    }

    @Post('counsel-banner')
    @ApiCreateCounselBannerAdminEndpoint()
    async createCounselBanner(@Body() data: CounselBannerCreateRequestDto): Promise<ApiResponseDto<CounselBannerResponseDto>> {
        const banner = await this.createCounselBannerUseCase.execute(data);
        return ApiResponseDto.success(banner, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.counselBannerCreated);
    }

    @Put('counsel-banner/:bannerId')
    @ApiUpdateCounselBannerAdminEndpoint()
    async updateCounselBanner(
        @Param('bannerId', new MongoObjectIdPipe('배너', '올바르지 않은 배너 ID 형식입니다.')) bannerId: string,
        @Body() data: CounselBannerUpdateRequestDto,
    ): Promise<ApiResponseDto<CounselBannerResponseDto>> {
        const banner = await this.updateCounselBannerUseCase.execute(bannerId, data);
        return ApiResponseDto.success(banner, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.counselBannerUpdated);
    }

    @Delete('counsel-banner/:bannerId')
    @ApiDeleteCounselBannerAdminEndpoint()
    async deleteCounselBanner(
        @Param('bannerId', new MongoObjectIdPipe('배너', '올바르지 않은 배너 ID 형식입니다.')) bannerId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteCounselBannerUseCase.execute(bannerId);
        return ApiResponseDto.success(null, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.counselBannerDeleted);
    }
}
