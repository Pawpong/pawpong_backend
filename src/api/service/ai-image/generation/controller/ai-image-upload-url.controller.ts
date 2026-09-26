import { BadRequestException, Body, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { AI_IMAGE_UPLOAD_MAX_BYTES } from '../../shared/domain/services/ai-image-object-key.service';
import { CreateAiImageUploadUrlUseCase } from '../application/use-cases/create-ai-image-upload-url.use-case';
import { UploadAiImageSourceUseCase } from '../application/use-cases/upload-ai-image-source.use-case';
import { AiImageGenerationController } from '../decorator/ai-image-generation-controller.decorator';
import { AiImageUploadUrlRequestDto } from '../dto/request/ai-image-upload-url-request.dto';
import type { AiImageSourceUploadResponseDto } from '../dto/response/ai-image-source-upload-response.dto';
import type { AiImageUploadUrlResponseDto } from '../dto/response/ai-image-upload-url-response.dto';
import { ApiCreateAiImageUploadUrlEndpoint, ApiUploadAiImageSourceEndpoint } from '../swagger/index';

/** 원본 사진 업로드 (presigned URL 발급 · 서버 경유 업로드) */
@AiImageGenerationController()
export class AiImageUploadUrlController {
    constructor(
        private readonly createAiImageUploadUrlUseCase: CreateAiImageUploadUrlUseCase,
        private readonly uploadAiImageSourceUseCase: UploadAiImageSourceUseCase,
    ) {}

    @Post('upload-url')
    @HttpCode(HttpStatus.OK)
    @ApiCreateAiImageUploadUrlEndpoint()
    async createUploadUrl(
        @Body() body: AiImageUploadUrlRequestDto,
    ): Promise<ApiResponseDto<AiImageUploadUrlResponseDto>> {
        const result = await this.createAiImageUploadUrlUseCase.execute(body.contentType);
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.uploadUrlIssued);
    }

    @Post('source')
    @HttpCode(HttpStatus.OK)
    @ApiUploadAiImageSourceEndpoint()
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: AI_IMAGE_UPLOAD_MAX_BYTES } }))
    async uploadSource(
        @UploadedFile() file: Express.Multer.File | undefined,
    ): Promise<ApiResponseDto<AiImageSourceUploadResponseDto>> {
        if (!file) {
            throw new BadRequestException(AI_IMAGE_RESPONSE_MESSAGES.uploadFileMissing);
        }
        const result = await this.uploadAiImageSourceUseCase.execute(file);
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.sourceUploaded);
    }
}
