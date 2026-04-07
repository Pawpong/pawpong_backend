import { Body, Get, Patch } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederManagementApplicationFormUseCase } from './application/use-cases/get-breeder-management-application-form.use-case';
import { UpdateBreederManagementApplicationFormUseCase } from './application/use-cases/update-breeder-management-application-form.use-case';
import { UpdateBreederManagementSimpleApplicationFormUseCase } from './application/use-cases/update-breeder-management-simple-application-form.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { ApplicationFormUpdateRequestDto } from './dto/request/application-form-update-request.dto';
import { SimpleApplicationFormUpdateRequestDto } from './dto/request/simple-application-form-update-request.dto';
import { ApplicationFormResponseDto } from './dto/response/application-form-response.dto';
import {
    ApplicationFormUpdateResponseDto,
    SimpleApplicationFormUpdateResponseDto,
} from './dto/response/application-form-update-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementApplicationFormController {
    constructor(
        private readonly getBreederManagementApplicationFormUseCase: GetBreederManagementApplicationFormUseCase,
        private readonly updateBreederManagementApplicationFormUseCase: UpdateBreederManagementApplicationFormUseCase,
        private readonly updateBreederManagementSimpleApplicationFormUseCase: UpdateBreederManagementSimpleApplicationFormUseCase,
    ) {}

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
