import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../feed/domain/services/feed-cache-key.service';
import { StorageService } from '../../../../common/storage/storage.service';

@Injectable()
export class FeedVideoAssetUrlService {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly storageService: StorageService,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async getSignedUrlWithCache(fileKey: string, ttlSeconds: number): Promise<string> {
        if (!fileKey) {
            return '';
        }

        const cacheKey = this.feedCacheKeyService.getSignedUrlKey(fileKey);
        const cached = await this.cacheManager.get<string>(cacheKey);
        if (cached) {
            return cached;
        }

        const url = this.storageService.generateSignedUrl(fileKey, ttlSeconds / 60);
        await this.cacheManager.set(cacheKey, url, (ttlSeconds - 600) * 1000);

        return url;
    }
}
