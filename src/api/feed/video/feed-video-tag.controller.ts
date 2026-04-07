import { Get, Query } from '@nestjs/common';

import { GetPopularTagsUseCase } from '../tag/application/use-cases/get-popular-tags.use-case';
import { SearchByTagUseCase } from '../tag/application/use-cases/search-by-tag.use-case';
import { SuggestTagsUseCase } from '../tag/application/use-cases/suggest-tags.use-case';
import { PopularTagItemDto, TagSearchResponseDto, TagSuggestionItemDto } from '../tag/dto/response/tag-response.dto';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import {
    ApiGetPopularFeedTagsEndpoint,
    ApiSearchFeedVideosByTagEndpoint,
    ApiSuggestFeedTagsEndpoint,
} from './swagger';

@FeedPublicController()
export class FeedVideoTagController {
    constructor(
        private readonly searchByTagUseCase: SearchByTagUseCase,
        private readonly getPopularTagsUseCase: GetPopularTagsUseCase,
        private readonly suggestTagsUseCase: SuggestTagsUseCase,
    ) {}

    @Get('tag/search')
    @ApiSearchFeedVideosByTagEndpoint()
    async searchByTag(
        @Query('tag') tag: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<TagSearchResponseDto> {
        return this.searchByTagUseCase.execute(tag, Number(page), Number(limit));
    }

    @Get('tag/popular')
    @ApiGetPopularFeedTagsEndpoint()
    async getPopularTags(@Query('limit') limit: number = 20): Promise<PopularTagItemDto[]> {
        return this.getPopularTagsUseCase.execute(Number(limit));
    }

    @Get('tag/suggest')
    @ApiSuggestFeedTagsEndpoint()
    async suggestTags(@Query('q') query: string, @Query('limit') limit: number = 10): Promise<TagSuggestionItemDto[]> {
        return this.suggestTagsUseCase.execute(query, Number(limit));
    }
}
