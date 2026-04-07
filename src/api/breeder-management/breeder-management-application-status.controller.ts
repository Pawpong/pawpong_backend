import { Body, Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UpdateBreederManagementApplicationStatusUseCase } from './application/use-cases/update-breeder-management-application-status.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { ApplicationStatusUpdateRequestDto } from './dto/request/application-status-update-request.dto';
import { ApplicationStatusUpdateResponseDto } from './dto/response/application-status-update-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementApplicationStatusController {
    constructor(
        private readonly updateBreederManagementApplicationStatusUseCase: UpdateBreederManagementApplicationStatusUseCase,
    ) {}

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
}
