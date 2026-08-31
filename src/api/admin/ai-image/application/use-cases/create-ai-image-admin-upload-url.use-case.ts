import { Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_FILE_STORAGE_PORT,
    type AiImageFileStoragePort,
} from '../../../../service/ai-image/shared/application/ports/ai-image-file-storage.port';
import { AiImageObjectKeyService } from '../../../../service/ai-image/shared/domain/services/ai-image-object-key.service';
import type {
    AiImageAdminUploadUrlCommand,
    AiImageAdminUploadUrlResult,
} from '../types/ai-image-admin-upload-url.type';

/**
 * presigned URL 유효 시간 (초).
 * 어드민은 썸네일·레퍼런스를 여러 장 올린 뒤 저장하므로 사용자 경로보다 넉넉하게 잡는다.
 */
const ADMIN_UPLOAD_URL_TTL_SECONDS = 1800;

/**
 * POST /ai-image-admin/upload-url
 *
 * 어드민이 필터 썸네일·레퍼런스 이미지와 미리보기용 원본을 버킷에 직접 올릴 수 있는
 * presigned PUT URL 을 발급한다. 서버가 이미지 바이트를 중계하지 않으므로
 * 2 vCPU 인스턴스에 업로드 트래픽이 얹히지 않는다.
 */
@Injectable()
export class CreateAiImageAdminUploadUrlUseCase {
    constructor(
        @Inject(AI_IMAGE_FILE_STORAGE_PORT)
        private readonly fileStorage: AiImageFileStoragePort,
        private readonly objectKey: AiImageObjectKeyService,
    ) {}

    async execute(command: AiImageAdminUploadUrlCommand): Promise<AiImageAdminUploadUrlResult> {
        const objectKey = this.objectKey.resolveAdminAssetKey(command.purpose, command.contentType);
        const uploadUrl = await this.fileStorage.generatePresignedUploadUrl(objectKey, ADMIN_UPLOAD_URL_TTL_SECONDS);

        return { uploadUrl, objectKey, expiresInSeconds: ADMIN_UPLOAD_URL_TTL_SECONDS };
    }
}
