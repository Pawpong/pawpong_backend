import { Inject, Injectable } from '@nestjs/common';

import { FeedTagQueryService } from '../../domain/services/feed-tag-query.service';
import { FEED_TAG_READER, type FeedTagReaderPort } from '../ports/feed-tag-reader.port';

@Injectable()
export class SuggestTagsUseCase {
    constructor(
        @Inject(FEED_TAG_READER)
        private readonly feedTagReader: FeedTagReaderPort,
        private readonly feedTagQueryService: FeedTagQueryService,
    ) {}

    async execute(query: string, limit: number = 10) {
        const cleanQuery = this.feedTagQueryService.normalizeTag(query);
        if (!cleanQuery) {
            return [];
        }

        return this.feedTagReader.suggestTags(cleanQuery, limit);
    }
}
