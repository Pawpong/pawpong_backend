import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedTagPresentationService } from '../../domain/services/feed-tag-presentation.service';
import { FeedTagQueryService } from '../../domain/services/feed-tag-query.service';
import { TagSearchResponseDto } from '../../dto/response/tag-response.dto';
import { FEED_TAG_ASSET_URL, type FeedTagAssetUrlPort } from '../ports/feed-tag-asset-url.port';
import { FEED_TAG_READER, type FeedTagReaderPort } from '../ports/feed-tag-reader.port';

@Injectable()
export class SearchByTagUseCase {
    constructor(
        @Inject(FEED_TAG_READER)
        private readonly feedTagReader: FeedTagReaderPort,
        private readonly feedTagQueryService: FeedTagQueryService,
        private readonly feedTagPresentationService: FeedTagPresentationService,
        @Inject(FEED_TAG_ASSET_URL)
        private readonly feedTagAssetUrl: FeedTagAssetUrlPort,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async execute(tag: string, page: number = 1, limit: number = 20): Promise<TagSearchResponseDto> {
        const cleanTag = this.feedTagQueryService.normalizeTag(tag);

        if (!cleanTag) {
            throw new BadRequestException('검색할 태그를 입력해주세요.');
        }

        const cacheKey = `video:tag:${cleanTag}:${page}:${limit}`;
        const cached = await this.cacheManager.get<TagSearchResponseDto>(cacheKey);
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
            (fileKey) => (fileKey ? this.feedTagAssetUrl.generateSignedUrl(fileKey, 50) : null),
        );

        await this.cacheManager.set(cacheKey, result, 300000);
        return result;
    }
}
