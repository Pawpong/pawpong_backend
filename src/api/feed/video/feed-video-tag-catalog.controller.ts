import { Get, Inject, Query } from '@nestjs/common';

import {
    GET_POPULAR_FEED_TAGS_USE_CASE,
    SUGGEST_FEED_TAGS_USE_CASE,
    type GetPopularFeedTagsUseCasePort,
    type SuggestFeedTagsUseCasePort,
} from '../tag/application/ports/feed-tag-interaction.port';
import type { FeedPopularTagResult, FeedTagSuggestionResult } from '../tag/application/types/feed-tag-result.type';
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
    async getPopularTags(@Query('limit') limit: number = 20): Promise<PopularTagItemDto[]> {
        return (await this.getPopularTagsUseCase.execute(Number(limit))) as Array<PopularTagItemDto & FeedPopularTagResult>;
    }

    @Get('tag/suggest')
    @ApiSuggestFeedTagsEndpoint()
    async suggestTags(@Query('q') query: string, @Query('limit') limit: number = 10): Promise<TagSuggestionItemDto[]> {
        return (await this.suggestTagsUseCase.execute(query, Number(limit))) as Array<
            TagSuggestionItemDto & FeedTagSuggestionResult
        >;
    }
}
