import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import type { CommunityAssetUrlPort } from '../application/ports/community-asset-url.port';

@Injectable()
export class CommunityAssetUrlStorageAdapter implements CommunityAssetUrlPort {
    constructor(private readonly storage: StorageService) {}

    toSignedUrl(fileName?: string | null): string | undefined {
        if (!fileName || fileName.trim().length === 0) return undefined;
        return this.storage.generateSignedUrl(fileName);
    }
}
