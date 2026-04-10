import { Body, HttpCode, HttpStatus, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UploadBreederManagementVerificationDocumentsUseCase } from './application/use-cases/upload-breeder-management-verification-documents.use-case';
import type { BreederManagementUploadDocumentsResult } from './application/types/breeder-management-result.type';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { UploadDocumentsRequestDto } from './dto/request/upload-documents-request.dto';
import { UploadDocumentsResponseDto } from './dto/response/upload-documents-response.dto';
import { ApiUploadBreederManagementVerificationDocumentsEndpoint } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementVerificationDocumentsController {
    constructor(
        private readonly uploadBreederManagementVerificationDocumentsUseCase: UploadBreederManagementVerificationDocumentsUseCase,
    ) {}

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
            result as UploadDocumentsResponseDto & BreederManagementUploadDocumentsResult,
            `${dto.level} 레벨 브리더 인증 서류 ${result.count}개가 업로드되었습니다.`,
        );
    }
}
