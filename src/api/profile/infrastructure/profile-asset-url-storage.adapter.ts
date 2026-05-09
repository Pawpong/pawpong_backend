import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import type { ProfileAssetUrlPort } from '../application/ports/profile-asset-url.port';

@Injectable()
export class ProfileAssetUrlStorageAdapter implements ProfileAssetUrlPort {
    constructor(private readonly storage: StorageService) {}

    toProfileImageUrl(fileName?: string | null): string | undefined {
        if (!fileName || fileName.trim().length === 0) return undefined;
        return this.storage.generateSignedUrl(fileName);
    }
}
