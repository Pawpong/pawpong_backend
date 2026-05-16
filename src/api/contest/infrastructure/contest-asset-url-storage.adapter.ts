import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import type { ContestAssetUrlPort } from '../application/ports/contest-asset-url.port';

@Injectable()
export class ContestAssetUrlStorageAdapter implements ContestAssetUrlPort {
    constructor(private readonly storage: StorageService) {}

    generateSignedUrl(fileName: string): Promise<string> {
        return Promise.resolve(this.storage.generateSignedUrl(fileName));
    }
}
