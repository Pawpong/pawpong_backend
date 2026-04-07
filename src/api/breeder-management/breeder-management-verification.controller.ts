import { Body, Get, HttpCode, HttpStatus, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederManagementVerificationStatusUseCase } from './application/use-cases/get-breeder-management-verification-status.use-case';
import { SubmitBreederManagementVerificationDocumentsUseCase } from './application/use-cases/submit-breeder-management-verification-documents.use-case';
import { SubmitBreederManagementVerificationUseCase } from './application/use-cases/submit-breeder-management-verification.use-case';
import { UploadBreederManagementVerificationDocumentsUseCase } from './application/use-cases/upload-breeder-management-verification-documents.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { SubmitDocumentsRequestDto } from './dto/request/submit-documents-request.dto';
import { UploadDocumentsRequestDto } from './dto/request/upload-documents-request.dto';
import { VerificationSubmitRequestDto } from './dto/request/verification-submit-request.dto';
import { UploadDocumentsResponseDto } from './dto/response/upload-documents-response.dto';
import { VerificationStatusResponseDto } from './dto/response/verification-status-response.dto';
import { VerificationSubmitResponseDto } from './dto/response/verification-submit-response.dto';
import {
    ApiUploadBreederManagementVerificationDocumentsEndpoint,
    BreederManagementSwaggerDocs,
} from './swagger';

@BreederManagementProtectedController()
export class BreederManagementVerificationController {
    constructor(
        private readonly getBreederManagementVerificationStatusUseCase: GetBreederManagementVerificationStatusUseCase,
        private readonly submitBreederManagementVerificationUseCase: SubmitBreederManagementVerificationUseCase,
        private readonly uploadBreederManagementVerificationDocumentsUseCase: UploadBreederManagementVerificationDocumentsUseCase,
        private readonly submitBreederManagementVerificationDocumentsUseCase: SubmitBreederManagementVerificationDocumentsUseCase,
    ) {}

    @Get('verification')
    @ApiEndpoint(BreederManagementSwaggerDocs.verificationStatus)
    async getVerificationStatus(
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<VerificationStatusResponseDto>> {
        const result = await this.getBreederManagementVerificationStatusUseCase.execute(userId);
        return ApiResponseDto.success(result, '인증 상태가 조회되었습니다.');
    }

    @Post('verification')
    @ApiEndpoint(BreederManagementSwaggerDocs.submitVerification)
    async submitVerification(
        @CurrentUser('userId') userId: string,
        @Body() verificationData: VerificationSubmitRequestDto,
    ): Promise<ApiResponseDto<VerificationSubmitResponseDto>> {
        const result = await this.submitBreederManagementVerificationUseCase.execute(userId, verificationData);
        return ApiResponseDto.success(result, '인증 신청이 성공적으로 제출되었습니다.');
    }

    @Post('verification/upload')
    @HttpCode(HttpStatus.OK)
    @ApiUploadBreederManagementVerificationDocumentsEndpoint()
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            limits: {
                fileSize: 100 * 1024 * 1024,
                files: 10,
            },
        }),
    )
    async uploadVerificationDocuments(
        @CurrentUser('userId') userId: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() dto: UploadDocumentsRequestDto,
    ): Promise<ApiResponseDto<UploadDocumentsResponseDto>> {
        const result = await this.uploadBreederManagementVerificationDocumentsUseCase.execute(
            userId,
            files,
            dto.types,
            dto.level,
        );

        return ApiResponseDto.success(
            result,
            `${dto.level} 레벨 브리더 인증 서류 ${result.count}개가 업로드되었습니다.`,
        );
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
