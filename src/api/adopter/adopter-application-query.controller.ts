import { Get, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetAdopterApplicationDetailUseCase } from './application/use-cases/get-adopter-application-detail.use-case';
import { GetAdopterApplicationsUseCase } from './application/use-cases/get-adopter-applications.use-case';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { ApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';
import { ApplicationListResponseDto } from './dto/response/application-list-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './domain/services/adopter-response-message.service';
import { ApiGetAdopterApplicationDetailEndpoint, ApiGetAdopterApplicationsEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterApplicationQueryController {
    constructor(
        private readonly getAdopterApplicationsUseCase: GetAdopterApplicationsUseCase,
        private readonly getAdopterApplicationDetailUseCase: GetAdopterApplicationDetailUseCase,
    ) {}

    @Get('applications')
    @ApiGetAdopterApplicationsEndpoint()
    async getMyApplications(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('animalType') animalType?: 'cat' | 'dog',
    ): Promise<ApiResponseDto<ApplicationListResponseDto>> {
        const result = await this.getAdopterApplicationsUseCase.execute(userId, Number(page), Number(limit), animalType);
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.applicationListRetrieved);
    }

    @Get('applications/:id')
    @ApiGetAdopterApplicationDetailEndpoint()
    async getApplicationDetail(
        @CurrentUser('userId') userId: string,
        @Param('id') applicationId: string,
    ): Promise<ApiResponseDto<ApplicationDetailResponseDto>> {
        const result = await this.getAdopterApplicationDetailUseCase.execute(userId, applicationId);
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.applicationDetailRetrieved);
    }
}
