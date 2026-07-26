import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../../../common/storage/storage.service';
import type { AiImageAssetUrlPort } from '../application/ports/ai-image-asset-url.port';

/**
 * 파일키 → 노출 URL 변환.
 * StorageService.generateSignedUrlSafe 는 이름과 달리 presign 이 아니라
 * CDN base URL 조립이다(공개 버킷). 기존 도메인들과 동일한 방식을 쓴다.
 */
@Injectable()
export class AiImageAssetUrlStorageAdapter implements AiImageAssetUrlPort {
    constructor(private readonly storageService: StorageService) {}

    toUrl(fileName: string | null | undefined): string | undefined {
        return this.storageService.generateSignedUrlSafe(fileName);
    }
}
