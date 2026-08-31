import { Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_FILE_STORAGE_PORT,
    type AiImageFileStoragePort,
} from '../../../shared/application/ports/ai-image-file-storage.port';
import { AiImageObjectKeyService } from '../../../shared/domain/services/ai-image-object-key.service';
import type { AiImageUploadUrlResult } from '../types/ai-image-upload-url-result.type';

/** presigned URL 기본 유효 시간 (초) */
const UPLOAD_URL_TTL_SECONDS = 600;

/**
 * POST v2/ai-image/upload-url
 * 원본 사진을 버킷에 직접 올릴 수 있는 presigned PUT URL 을 발급한다.
 */
@Injectable()
export class CreateAiImageUploadUrlUseCase {
    constructor(
        @Inject(AI_IMAGE_FILE_STORAGE_PORT)
        private readonly fileStorage: AiImageFileStoragePort,
        private readonly objectKey: AiImageObjectKeyService,
    ) {}

    async execute(contentType: string): Promise<AiImageUploadUrlResult> {
        const inputObjectKey = this.objectKey.resolveSourceKey(contentType);
        const uploadUrl = await this.fileStorage.generatePresignedUploadUrl(inputObjectKey, UPLOAD_URL_TTL_SECONDS);

        return { uploadUrl, inputObjectKey, expiresInSeconds: UPLOAD_URL_TTL_SECONDS };
    }
}
