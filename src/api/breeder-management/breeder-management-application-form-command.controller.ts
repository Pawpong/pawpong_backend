import { Body, Patch } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UpdateBreederManagementApplicationFormUseCase } from './application/use-cases/update-breeder-management-application-form.use-case';
import { UpdateBreederManagementSimpleApplicationFormUseCase } from './application/use-cases/update-breeder-management-simple-application-form.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './domain/services/breeder-management-response-message.service';
import { ApplicationFormUpdateRequestDto } from './dto/request/application-form-update-request.dto';
import { SimpleApplicationFormUpdateRequestDto } from './dto/request/simple-application-form-update-request.dto';
import {
    ApplicationFormUpdateResponseDto,
    SimpleApplicationFormUpdateResponseDto,
} from './dto/response/application-form-update-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementApplicationFormCommandController {
    constructor(
        private readonly updateBreederManagementApplicationFormUseCase: UpdateBreederManagementApplicationFormUseCase,
        private readonly updateBreederManagementSimpleApplicationFormUseCase: UpdateBreederManagementSimpleApplicationFormUseCase,
    ) {}

    @Patch('application-form')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateApplicationForm)
    async updateApplicationForm(
        @CurrentUser('userId') userId: string,
        @Body() updateDto: ApplicationFormUpdateRequestDto,
    ): Promise<ApiResponseDto<ApplicationFormUpdateResponseDto>> {
        const result = await this.updateBreederManagementApplicationFormUseCase.execute(userId, updateDto);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdated);
    }

    @Patch('application-form/simple')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateApplicationFormSimple)
    async updateApplicationFormSimple(
        @CurrentUser('userId') userId: string,
        @Body() updateDto: SimpleApplicationFormUpdateRequestDto,
    ): Promise<ApiResponseDto<SimpleApplicationFormUpdateResponseDto>> {
        const result = await this.updateBreederManagementSimpleApplicationFormUseCase.execute(userId, updateDto.questions);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdated);
    }
}
