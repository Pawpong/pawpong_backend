import { Body, HttpCode, HttpStatus, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UploadAuthBreederDocumentsUseCase } from './application/use-cases/upload-auth-breeder-documents.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthUploadPresentationService } from './domain/services/auth-upload-presentation.service';
import { UploadBreederDocumentsRequestDto } from './dto/request/upload-breeder-documents-request.dto';
import { VerificationDocumentsResponseDto } from './dto/response/verification-documents-response.dto';
import { ApiUploadBreederDocumentsEndpoint } from './swagger';

@AuthPublicController()
export class AuthBreederDocumentsUploadController {
    constructor(
        private readonly uploadAuthBreederDocumentsUseCase: UploadAuthBreederDocumentsUseCase,
        private readonly authUploadPresentationService: AuthUploadPresentationService,
    ) {}

    @Post('upload-breeder-documents')
    @HttpCode(HttpStatus.OK)
    @ApiUploadBreederDocumentsEndpoint()
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            limits: {
                fileSize: 100 * 1024 * 1024,
                files: 10,
            },
        }),
    )
    async uploadBreederDocuments(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() dto: UploadBreederDocumentsRequestDto,
        @Query('tempId') tempId?: string,
    ): Promise<ApiResponseDto<VerificationDocumentsResponseDto>> {
        const result = await this.uploadAuthBreederDocumentsUseCase.execute(files, dto.types, dto.level, tempId);
        const message = this.authUploadPresentationService.getBreederDocumentsUploadMessage(
            dto.level,
            result.count,
            tempId,
        );
        return ApiResponseDto.success(result.response, message);
    }
}
