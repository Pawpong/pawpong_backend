import { Get, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { ReceivedApplicationListResponseDto } from '../breeder/dto/response/received-application-list-response.dto';
import { GetBreederManagementApplicationDetailUseCase } from './application/use-cases/get-breeder-management-application-detail.use-case';
import { GetBreederManagementReceivedApplicationsUseCase } from './application/use-cases/get-breeder-management-received-applications.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
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
        return ApiResponseDto.success(result, '입양 신청 목록이 조회되었습니다.');
    }

    @Get('applications/:applicationId')
    @ApiEndpoint(BreederManagementSwaggerDocs.applicationDetail)
    async getApplicationDetail(
        @CurrentUser('userId') userId: string,
        @Param('applicationId') applicationId: string,
    ): Promise<ApiResponseDto<BreederManagementApplicationDetailResponseDto>> {
        const result = await this.getBreederManagementApplicationDetailUseCase.execute(userId, applicationId);
        return ApiResponseDto.success(result, '입양 신청 상세 정보가 조회되었습니다.');
    }
}
