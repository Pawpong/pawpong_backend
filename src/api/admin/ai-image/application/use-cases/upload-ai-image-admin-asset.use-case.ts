import { Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_ASSET_URL_PORT,
    type AiImageAssetUrlPort,
} from '../../../../service/ai-image/shared/application/ports/ai-image-asset-url.port';
import {
    AI_IMAGE_FILE_STORAGE_PORT,
    type AiImageFileStoragePort,
} from '../../../../service/ai-image/shared/application/ports/ai-image-file-storage.port';
import {
    AiImageObjectKeyService,
    type AiImageAdminAssetPurpose,
} from '../../../../service/ai-image/shared/domain/services/ai-image-object-key.service';

/**
 * POST /ai-image-admin/asset
 * 어드민 화면에서 고른 썸네일·레퍼런스·시험 원본을 서버 경유로 올린다.
 * 버킷 CORS 가 없어 브라우저 presigned PUT 이 막히기 때문이다. 키 규칙은 presign 경로와 같다.
 */
@Injectable()
export class UploadAiImageAdminAssetUseCase {
    constructor(
        @Inject(AI_IMAGE_FILE_STORAGE_PORT)
        private readonly fileStorage: AiImageFileStoragePort,
        @Inject(AI_IMAGE_ASSET_URL_PORT)
        private readonly assetUrl: AiImageAssetUrlPort,
        private readonly objectKey: AiImageObjectKeyService,
    ) {}

    async execute(
        purpose: AiImageAdminAssetPurpose,
        file: { buffer: Buffer; mimetype: string },
    ): Promise<{ objectKey: string; imageUrl: string | null }> {
        const objectKey = this.objectKey.resolveAdminAssetKey(purpose, file.mimetype);
        await this.fileStorage.upload(objectKey, file.buffer, file.mimetype);
        return { objectKey, imageUrl: this.assetUrl.toUrl(objectKey) ?? null };
    }
}
