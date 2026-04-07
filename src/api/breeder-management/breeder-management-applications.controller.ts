import { Body, Get, Param, Patch, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { ReceivedApplicationListResponseDto } from '../breeder/dto/response/received-application-list-response.dto';
import { GetBreederManagementApplicationDetailUseCase } from './application/use-cases/get-breeder-management-application-detail.use-case';
import { GetBreederManagementApplicationFormUseCase } from './application/use-cases/get-breeder-management-application-form.use-case';
import { GetBreederManagementReceivedApplicationsUseCase } from './application/use-cases/get-breeder-management-received-applications.use-case';
import { UpdateBreederManagementApplicationFormUseCase } from './application/use-cases/update-breeder-management-application-form.use-case';
import { UpdateBreederManagementApplicationStatusUseCase } from './application/use-cases/update-breeder-management-application-status.use-case';
import { UpdateBreederManagementSimpleApplicationFormUseCase } from './application/use-cases/update-breeder-management-simple-application-form.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { ApplicationFormUpdateRequestDto } from './dto/request/application-form-update-request.dto';
import { ApplicationStatusUpdateRequestDto } from './dto/request/application-status-update-request.dto';
import { ApplicationsGetRequestDto } from './dto/request/applications-fetch-request.dto';
import { SimpleApplicationFormUpdateRequestDto } from './dto/request/simple-application-form-update-request.dto';
import { ApplicationFormResponseDto } from './dto/response/application-form-response.dto';
import {
    ApplicationFormUpdateResponseDto,
    SimpleApplicationFormUpdateResponseDto,
} from './dto/response/application-form-update-response.dto';
import { BreederManagementApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';
import { ApplicationStatusUpdateResponseDto } from './dto/response/application-status-update-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementApplicationsController {
    constructor(
        private readonly getBreederManagementReceivedApplicationsUseCase: GetBreederManagementReceivedApplicationsUseCase,
        private readonly getBreederManagementApplicationDetailUseCase: GetBreederManagementApplicationDetailUseCase,
        private readonly updateBreederManagementApplicationStatusUseCase: UpdateBreederManagementApplicationStatusUseCase,
        private readonly getBreederManagementApplicationFormUseCase: GetBreederManagementApplicationFormUseCase,
        private readonly updateBreederManagementApplicationFormUseCase: UpdateBreederManagementApplicationFormUseCase,
        private readonly updateBreederManagementSimpleApplicationFormUseCase: UpdateBreederManagementSimpleApplicationFormUseCase,
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

    @Patch('applications/:applicationId')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateApplicationStatus)
    async updateApplicationStatus(
        @CurrentUser('userId') userId: string,
        @Param('applicationId') applicationId: string,
        @Body() updateData: ApplicationStatusUpdateRequestDto,
    ): Promise<ApiResponseDto<ApplicationStatusUpdateResponseDto>> {
        const result = await this.updateBreederManagementApplicationStatusUseCase.execute(userId, applicationId, updateData);
        return ApiResponseDto.success(result, '입양 신청 상태가 성공적으로 변경되었습니다.');
    }

    @Get('application-form')
    @ApiEndpoint(BreederManagementSwaggerDocs.applicationForm)
    async getApplicationForm(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<ApplicationFormResponseDto>> {
        const result = await this.getBreederManagementApplicationFormUseCase.execute(userId);
        return ApiResponseDto.success(result, '입양 신청 폼이 조회되었습니다.');
    }

    @Patch('application-form')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateApplicationForm)
    async updateApplicationForm(
        @CurrentUser('userId') userId: string,
        @Body() updateDto: ApplicationFormUpdateRequestDto,
    ): Promise<ApiResponseDto<ApplicationFormUpdateResponseDto>> {
        const result = await this.updateBreederManagementApplicationFormUseCase.execute(userId, updateDto);
        return ApiResponseDto.success(result, '입양 신청 폼이 업데이트되었습니다.');
    }

    @Patch('application-form/simple')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateApplicationFormSimple)
    async updateApplicationFormSimple(
        @CurrentUser('userId') userId: string,
        @Body() updateDto: SimpleApplicationFormUpdateRequestDto,
    ): Promise<ApiResponseDto<SimpleApplicationFormUpdateResponseDto>> {
        const result = await this.updateBreederManagementSimpleApplicationFormUseCase.execute(userId, updateDto.questions);
        return ApiResponseDto.success(result, '입양 신청 폼이 업데이트되었습니다.');
    }
}
