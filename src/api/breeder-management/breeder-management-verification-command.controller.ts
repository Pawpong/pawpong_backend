import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { SubmitBreederManagementVerificationDocumentsUseCase } from './application/use-cases/submit-breeder-management-verification-documents.use-case';
import { SubmitBreederManagementVerificationUseCase } from './application/use-cases/submit-breeder-management-verification.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { SubmitDocumentsRequestDto } from './dto/request/submit-documents-request.dto';
import { VerificationSubmitRequestDto } from './dto/request/verification-submit-request.dto';
import { VerificationSubmitResponseDto } from './dto/response/verification-submit-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementVerificationCommandController {
    constructor(
        private readonly submitBreederManagementVerificationUseCase: SubmitBreederManagementVerificationUseCase,
        private readonly submitBreederManagementVerificationDocumentsUseCase: SubmitBreederManagementVerificationDocumentsUseCase,
    ) {}

    @Post('verification')
    @ApiEndpoint(BreederManagementSwaggerDocs.submitVerification)
    async submitVerification(
        @CurrentUser('userId') userId: string,
        @Body() verificationData: VerificationSubmitRequestDto,
    ): Promise<ApiResponseDto<VerificationSubmitResponseDto>> {
        const result = await this.submitBreederManagementVerificationUseCase.execute(userId, verificationData);
        return ApiResponseDto.success(result, '인증 신청이 성공적으로 제출되었습니다.');
    }

    @Post('verification/submit')
    @HttpCode(HttpStatus.OK)
    @ApiEndpoint(BreederManagementSwaggerDocs.submitVerificationDocuments)
    async submitVerificationDocuments(
        @CurrentUser('userId') userId: string,
        @Body() dto: SubmitDocumentsRequestDto,
    ): Promise<ApiResponseDto<VerificationSubmitResponseDto>> {
        const result = await this.submitBreederManagementVerificationDocumentsUseCase.execute(userId, dto);
        return ApiResponseDto.success(result, '입점 서류 제출이 완료되었습니다.');
    }
}
