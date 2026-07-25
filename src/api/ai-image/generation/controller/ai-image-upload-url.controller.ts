import { Body, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { CreateAiImageUploadUrlUseCase } from '../application/use-cases/create-ai-image-upload-url.use-case';
import { AiImageGenerationController } from '../decorator/ai-image-generation-controller.decorator';
import { AiImageUploadUrlRequestDto } from '../dto/request/ai-image-upload-url-request.dto';
import type { AiImageUploadUrlResponseDto } from '../dto/response/ai-image-upload-url-response.dto';
import { ApiCreateAiImageUploadUrlEndpoint } from '../swagger';

/** 원본 사진 업로드용 presigned URL 발급 */
@AiImageGenerationController()
export class AiImageUploadUrlController {
    constructor(private readonly createAiImageUploadUrlUseCase: CreateAiImageUploadUrlUseCase) {}

    @Post('upload-url')
    @ApiCreateAiImageUploadUrlEndpoint()
    async createUploadUrl(
        @Body() body: AiImageUploadUrlRequestDto,
    ): Promise<ApiResponseDto<AiImageUploadUrlResponseDto>> {
        const result = await this.createAiImageUploadUrlUseCase.execute(body.contentType);
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.uploadUrlIssued);
    }
}
