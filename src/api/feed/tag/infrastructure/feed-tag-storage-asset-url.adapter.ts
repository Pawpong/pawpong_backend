import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import { FeedTagAssetUrlPort } from '../application/ports/feed-tag-asset-url.port';

@Injectable()
export class FeedTagStorageAssetUrlAdapter implements FeedTagAssetUrlPort {
    constructor(private readonly storageService: StorageService) {}

    generateSignedUrl(fileKey: string, expirationMinutes?: number): string {
        return this.storageService.generateSignedUrl(fileKey, expirationMinutes);
    }
}
