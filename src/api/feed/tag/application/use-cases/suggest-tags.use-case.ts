import { Inject, Injectable } from '@nestjs/common';

import { FeedTagQueryService } from '../../domain/services/feed-tag-query.service';
import { FEED_TAG_READER_PORT, type FeedTagReaderPort } from '../ports/feed-tag-reader.port';
import type { FeedTagSuggestionResult } from '../types/feed-tag-result.type';

@Injectable()
export class SuggestTagsUseCase {
    constructor(
        @Inject(FEED_TAG_READER_PORT)
        private readonly feedTagReader: FeedTagReaderPort,
        private readonly feedTagQueryService: FeedTagQueryService,
    ) {}

    async execute(query: string, limit: number = 10): Promise<FeedTagSuggestionResult[]> {
        const cleanQuery = this.feedTagQueryService.normalizeTag(query);
        if (!cleanQuery) {
            return [];
        }

        return this.feedTagReader.suggestTags(cleanQuery, limit);
    }
}
