import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import type { AiImageFileStoragePort } from '../application/ports/ai-image-file-storage.port';

/**
 * 원본 사진 직업로드용 presigned PUT URL 발급.
 * 2코어 서버가 이미지 바이트를 직접 받지 않도록 버킷 직업로드를 사용한다.
 */
@Injectable()
export class AiImageFileStorageAdapter implements AiImageFileStoragePort {
    constructor(private readonly storageService: StorageService) {}

    generatePresignedUploadUrl(fileKey: string, expiresInSeconds: number): Promise<string> {
        return this.storageService.generatePresignedUploadUrl(fileKey, expiresInSeconds);
    }
}
