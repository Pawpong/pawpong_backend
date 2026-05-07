import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import { AdoptionAssetUrlPort } from '../application/ports/adoption-asset-url.port';

@Injectable()
export class AdoptionStorageAssetUrlAdapter implements AdoptionAssetUrlPort {
    constructor(private readonly storageService: StorageService) {}

    async generateSignedUrl(fileName: string, expirationMinutes: number = 30): Promise<string> {
        // StorageService.generateSignedUrl 은 동기 string 을 반환하지만
        // 포트 계약은 Promise<string> 으로 두어 향후 비동기 구현(외부 호출)으로 교체 가능하도록 한다.
        return this.storageService.generateSignedUrl(fileName, expirationMinutes);
    }
}
