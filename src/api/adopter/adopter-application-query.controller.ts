import { Get, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetAdopterApplicationDetailUseCase } from './application/use-cases/get-adopter-application-detail.use-case';
import { GetAdopterApplicationsUseCase } from './application/use-cases/get-adopter-applications.use-case';
import type { AdopterApplicationDetailResult } from './application/types/adopter-result.type';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { AdopterApplicationsQueryRequestDto } from './dto/request/adopter-pagination-query-request.dto';
import { ApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';
import { ApplicationListResponseDto } from './dto/response/application-list-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './constants/adopter-response-messages';
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
        @Query() query: AdopterApplicationsQueryRequestDto,
    ): Promise<ApiResponseDto<ApplicationListResponseDto>> {
        const result = await this.getAdopterApplicationsUseCase.execute(
            userId,
            query.page,
            query.limit,
            query.animalType,
        );
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result) as ApplicationListResponseDto,
            ADOPTER_RESPONSE_MESSAGES.applicationListRetrieved,
        );
    }

    @Get('applications/:id')
    @ApiGetAdopterApplicationDetailEndpoint()
    async getApplicationDetail(
        @CurrentUser('userId') userId: string,
        @Param('id') applicationId: string,
    ): Promise<ApiResponseDto<ApplicationDetailResponseDto>> {
        const result = await this.getAdopterApplicationDetailUseCase.execute(userId, applicationId);
        return ApiResponseDto.success(
            result as ApplicationDetailResponseDto & AdopterApplicationDetailResult,
            ADOPTER_RESPONSE_MESSAGES.applicationDetailRetrieved,
        );
    }
}
