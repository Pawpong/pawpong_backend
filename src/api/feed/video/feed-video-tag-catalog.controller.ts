import { Get, Inject, Query } from '@nestjs/common';

import type {
    GetPopularFeedTagsUseCasePort,
    SuggestFeedTagsUseCasePort,
} from '../tag/application/ports/feed-tag-interaction.port';
import {
    GET_POPULAR_FEED_TAGS_USE_CASE,
    SUGGEST_FEED_TAGS_USE_CASE,
} from '../tag/application/tokens/feed-tag-interaction.token';
import type { FeedPopularTagResult, FeedTagSuggestionResult } from '../tag/application/types/feed-tag-result.type';
import { FeedPopularTagLimitQueryDto, FeedSuggestTagQueryDto } from './dto/request/feed-limit-query.dto';
import { PopularTagItemDto, TagSuggestionItemDto } from '../tag/dto/response/tag-response.dto';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { ApiGetPopularFeedTagsEndpoint, ApiSuggestFeedTagsEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoTagCatalogController {
    constructor(
        @Inject(GET_POPULAR_FEED_TAGS_USE_CASE)
        private readonly getPopularTagsUseCase: GetPopularFeedTagsUseCasePort,
        @Inject(SUGGEST_FEED_TAGS_USE_CASE)
        private readonly suggestTagsUseCase: SuggestFeedTagsUseCasePort,
    ) {}

    @Get('tag/popular')
    @ApiGetPopularFeedTagsEndpoint()
    async getPopularTags(@Query() query: FeedPopularTagLimitQueryDto): Promise<PopularTagItemDto[]> {
        return (await this.getPopularTagsUseCase.execute(query.limit)) as Array<PopularTagItemDto & FeedPopularTagResult>;
    }

    @Get('tag/suggest')
    @ApiSuggestFeedTagsEndpoint()
    async suggestTags(@Query() query: FeedSuggestTagQueryDto): Promise<TagSuggestionItemDto[]> {
        return (await this.suggestTagsUseCase.execute(query.q, query.limit)) as Array<
            TagSuggestionItemDto & FeedTagSuggestionResult
        >;
    }
}
