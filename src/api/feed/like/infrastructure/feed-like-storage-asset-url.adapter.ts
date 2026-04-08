import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import { FeedLikeAssetUrlPort } from '../application/ports/feed-like-asset-url.port';

@Injectable()
export class FeedLikeStorageAssetUrlAdapter implements FeedLikeAssetUrlPort {
    constructor(private readonly storageService: StorageService) {}

    generateSignedUrl(fileKey: string, expirationMinutes?: number): string {
        return this.storageService.generateSignedUrl(fileKey, expirationMinutes);
    }
}
