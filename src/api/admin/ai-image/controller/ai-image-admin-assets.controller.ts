import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../../service/ai-image/constants/ai-image-response-messages';
import { CreateAiImageAdminUploadUrlUseCase } from '../application/use-cases/create-ai-image-admin-upload-url.use-case';
import { AiImageAdminController } from '../decorator/ai-image-admin-controller.decorator';
import { AiImageAdminUploadUrlRequestDto } from '../dto/request/ai-image-admin-upload-url-request.dto';
import type { AiImageAdminUploadUrlResponseDto } from '../dto/response/ai-image-admin-upload-url-response.dto';
import { ApiCreateAiImageAdminUploadUrlEndpoint } from '../swagger/index';

/** 필터 애셋 업로드 URL 발급 (관리자) */
@AiImageAdminController()
export class AiImageAdminAssetsController {
    constructor(private readonly createAiImageAdminUploadUrlUseCase: CreateAiImageAdminUploadUrlUseCase) {}

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
}
