import { Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_ASSET_URL_PORT,
    type AiImageAssetUrlPort,
} from '../../../shared/application/ports/ai-image-asset-url.port';
import {
    AI_IMAGE_FILE_STORAGE_PORT,
    type AiImageFileStoragePort,
} from '../../../shared/application/ports/ai-image-file-storage.port';
import { AiImageObjectKeyService } from '../../../shared/domain/services/ai-image-object-key.service';
import type { AiImageSourceUploadResult } from '../types/ai-image-source-upload-result.type';

/**
 * POST v2/ai-image/source
 * 원본 사진을 서버 경유로 올리고 생성 요청에 넘길 파일키를 돌려준다.
 * 키 규칙·MIME 허용은 presign 경로와 같은 AiImageObjectKeyService 를 쓴다.
 */
@Injectable()
export class UploadAiImageSourceUseCase {
    constructor(
        @Inject(AI_IMAGE_FILE_STORAGE_PORT)
        private readonly fileStorage: AiImageFileStoragePort,
        @Inject(AI_IMAGE_ASSET_URL_PORT)
        private readonly assetUrl: AiImageAssetUrlPort,
        private readonly objectKey: AiImageObjectKeyService,
    ) {}

    async execute(file: { buffer: Buffer; mimetype: string }): Promise<AiImageSourceUploadResult> {
        const inputObjectKey = this.objectKey.resolveSourceKey(file.mimetype);
        await this.fileStorage.upload(inputObjectKey, file.buffer, file.mimetype);
        return { inputObjectKey, imageUrl: this.assetUrl.toUrl(inputObjectKey) ?? null };
    }
}
