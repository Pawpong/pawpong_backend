import { Get } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederManagementApplicationFormUseCase } from './application/use-cases/get-breeder-management-application-form.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './constants/breeder-management-response-messages';
import { ApplicationFormResponseDto } from './dto/response/application-form-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementApplicationFormQueryController {
    constructor(
        private readonly getBreederManagementApplicationFormUseCase: GetBreederManagementApplicationFormUseCase,
    ) {}

    @Get('application-form')
    @ApiEndpoint(BreederManagementSwaggerDocs.applicationForm)
    async getApplicationForm(
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<ApplicationFormResponseDto>> {
        const result = await this.getBreederManagementApplicationFormUseCase.execute(userId);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormRetrieved);
    }
}
