import { Body, Get, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CreateAdopterApplicationUseCase } from './application/use-cases/create-adopter-application.use-case';
import { GetAdopterApplicationDetailUseCase } from './application/use-cases/get-adopter-application-detail.use-case';
import { GetAdopterApplicationsUseCase } from './application/use-cases/get-adopter-applications.use-case';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { ApplicationCreateRequestDto } from './dto/request/application-create-request.dto';
import { ApplicationCreateResponseDto } from './dto/response/application-create-response.dto';
import { ApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';
import { ApplicationListResponseDto } from './dto/response/application-list-response.dto';
import {
    ApiCreateAdopterApplicationEndpoint,
    ApiGetAdopterApplicationDetailEndpoint,
    ApiGetAdopterApplicationsEndpoint,
} from './swagger';

@AdopterProtectedController()
export class AdopterApplicationController {
    constructor(
        private readonly createAdopterApplicationUseCase: CreateAdopterApplicationUseCase,
        private readonly getAdopterApplicationsUseCase: GetAdopterApplicationsUseCase,
        private readonly getAdopterApplicationDetailUseCase: GetAdopterApplicationDetailUseCase,
    ) {}

    @Post('application')
    @ApiCreateAdopterApplicationEndpoint()
    async createApplication(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() createApplicationDto: ApplicationCreateRequestDto,
    ): Promise<ApiResponseDto<ApplicationCreateResponseDto>> {
        const result = await this.createAdopterApplicationUseCase.execute(userId, createApplicationDto, role);
        return ApiResponseDto.success(result, '입양 신청이 성공적으로 제출되었습니다.');
    }

    @Get('applications')
    @ApiGetAdopterApplicationsEndpoint()
    async getMyApplications(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('animalType') animalType?: 'cat' | 'dog',
    ): Promise<ApiResponseDto<ApplicationListResponseDto>> {
        const result = await this.getAdopterApplicationsUseCase.execute(userId, Number(page), Number(limit), animalType);
        return ApiResponseDto.success(result, '입양 신청 목록이 조회되었습니다.');
    }

    @Get('applications/:id')
    @ApiGetAdopterApplicationDetailEndpoint()
    async getApplicationDetail(
        @CurrentUser('userId') userId: string,
        @Param('id') applicationId: string,
    ): Promise<ApiResponseDto<ApplicationDetailResponseDto>> {
        const result = await this.getAdopterApplicationDetailUseCase.execute(userId, applicationId);
        return ApiResponseDto.success(result, '입양 신청 상세 정보가 조회되었습니다.');
    }
}
