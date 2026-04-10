import { Get, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../common/pipe/mongo-object-id.pipe';
import { ReceivedApplicationListResponseDto } from '../breeder/dto/response/received-application-list-response.dto';
import { GetBreederManagementApplicationDetailUseCase } from './application/use-cases/get-breeder-management-application-detail.use-case';
import { GetBreederManagementReceivedApplicationsUseCase } from './application/use-cases/get-breeder-management-received-applications.use-case';
import type {
    BreederManagementApplicationDetailResult,
    BreederManagementReceivedApplicationsPageResult,
} from './application/types/breeder-management-result.type';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './domain/services/breeder-management-response-message.service';
import { ApplicationsGetRequestDto } from './dto/request/applications-fetch-request.dto';
import { BreederManagementApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementApplicationsQueryController {
    constructor(
        private readonly getBreederManagementReceivedApplicationsUseCase: GetBreederManagementReceivedApplicationsUseCase,
        private readonly getBreederManagementApplicationDetailUseCase: GetBreederManagementApplicationDetailUseCase,
    ) {}

    @Get('applications')
    @ApiEndpoint(BreederManagementSwaggerDocs.receivedApplications)
    async getReceivedApplications(
        @CurrentUser('userId') userId: string,
        @Query() queryParams: ApplicationsGetRequestDto,
    ): Promise<ApiResponseDto<ReceivedApplicationListResponseDto>> {
        const result = await this.getBreederManagementReceivedApplicationsUseCase.execute(
            userId,
            queryParams.page || 1,
            queryParams.limit || 10,
        );
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result) as ReceivedApplicationListResponseDto & BreederManagementReceivedApplicationsPageResult,
            BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationListRetrieved,
        );
    }

    @Get('applications/:applicationId')
    @ApiEndpoint(BreederManagementSwaggerDocs.applicationDetail)
    async getApplicationDetail(
        @CurrentUser('userId') userId: string,
        @Param('applicationId', new MongoObjectIdPipe('입양 신청', '올바르지 않은 입양 신청 ID 형식입니다.'))
        applicationId: string,
    ): Promise<ApiResponseDto<BreederManagementApplicationDetailResponseDto>> {
        const result = await this.getBreederManagementApplicationDetailUseCase.execute(userId, applicationId);
        return ApiResponseDto.success(
            result as BreederManagementApplicationDetailResponseDto & BreederManagementApplicationDetailResult,
            BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationDetailRetrieved,
        );
    }
}
