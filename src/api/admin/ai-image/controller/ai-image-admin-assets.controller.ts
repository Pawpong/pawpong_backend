import { BadRequestException, Body, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../../service/ai-image/constants/ai-image-response-messages';
import { AI_IMAGE_UPLOAD_MAX_BYTES } from '../../../service/ai-image/shared/domain/services/ai-image-object-key.service';
import { CreateAiImageAdminUploadUrlUseCase } from '../application/use-cases/create-ai-image-admin-upload-url.use-case';
import { UploadAiImageAdminAssetUseCase } from '../application/use-cases/upload-ai-image-admin-asset.use-case';
import { AiImageAdminController } from '../decorator/ai-image-admin-controller.decorator';
import { AiImageAdminAssetUploadRequestDto } from '../dto/request/ai-image-admin-asset-upload-request.dto';
import { AiImageAdminUploadUrlRequestDto } from '../dto/request/ai-image-admin-upload-url-request.dto';
import type { AiImageAdminAssetUploadResponseDto } from '../dto/response/ai-image-admin-asset-upload-response.dto';
import type { AiImageAdminUploadUrlResponseDto } from '../dto/response/ai-image-admin-upload-url-response.dto';
import { ApiCreateAiImageAdminUploadUrlEndpoint, ApiUploadAiImageAdminAssetEndpoint } from '../swagger/index';

/** 필터 애셋 업로드 (관리자) */
@AiImageAdminController()
export class AiImageAdminAssetsController {
    constructor(
        private readonly createAiImageAdminUploadUrlUseCase: CreateAiImageAdminUploadUrlUseCase,
        private readonly uploadAiImageAdminAssetUseCase: UploadAiImageAdminAssetUseCase,
    ) {}

    @Post('upload-url')
    @HttpCode(HttpStatus.OK)
    @ApiCreateAiImageAdminUploadUrlEndpoint()
    async createUploadUrl(
        @Body() body: AiImageAdminUploadUrlRequestDto,
    ): Promise<ApiResponseDto<AiImageAdminUploadUrlResponseDto>> {
        const result = await this.createAiImageAdminUploadUrlUseCase.execute({
            purpose: body.purpose,
            contentType: body.contentType ?? 'image/png',
        });
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.adminUploadUrlIssued);
    }

    @Post('asset')
    @HttpCode(HttpStatus.OK)
    @ApiUploadAiImageAdminAssetEndpoint()
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: AI_IMAGE_UPLOAD_MAX_BYTES } }))
    async uploadAsset(
        @Body() body: AiImageAdminAssetUploadRequestDto,
        @UploadedFile() file: Express.Multer.File | undefined,
    ): Promise<ApiResponseDto<AiImageAdminAssetUploadResponseDto>> {
        if (!file) {
            throw new BadRequestException(AI_IMAGE_RESPONSE_MESSAGES.uploadFileMissing);
        }
        const result = await this.uploadAiImageAdminAssetUseCase.execute(body.purpose, file);
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.adminAssetUploaded);
    }
}
