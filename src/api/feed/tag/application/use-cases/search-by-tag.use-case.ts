import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { StorageService } from '../../../../../common/storage/storage.service';
import { FeedTagPresentationService } from '../../domain/services/feed-tag-presentation.service';
import { FeedTagQueryService } from '../../domain/services/feed-tag-query.service';
import { FEED_TAG_READER, type FeedTagReaderPort } from '../ports/feed-tag-reader.port';

@Injectable()
export class SearchByTagUseCase {
    constructor(
        @Inject(FEED_TAG_READER)
        private readonly feedTagReader: FeedTagReaderPort,
        private readonly feedTagQueryService: FeedTagQueryService,
        private readonly feedTagPresentationService: FeedTagPresentationService,
        private readonly storageService: StorageService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async execute(tag: string, page: number = 1, limit: number = 20) {
        const cleanTag = this.feedTagQueryService.normalizeTag(tag);
        const cacheKey = `video:tag:${cleanTag}:${page}:${limit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }

        const skip = (page - 1) * limit;
        const [videos, totalCount] = await Promise.all([
            this.feedTagReader.readByTag(cleanTag, skip, limit),
            this.feedTagReader.countByTag(cleanTag),
        ]);

        const result = await this.feedTagPresentationService.buildSearchResponse(
            videos,
            cleanTag,
            page,
            limit,
            totalCount,
            (fileKey) => (fileKey ? this.storageService.generateSignedUrl(fileKey, 50) : null),
        );

        await this.cacheManager.set(cacheKey, result, 300000);
        return result;
    }
}
