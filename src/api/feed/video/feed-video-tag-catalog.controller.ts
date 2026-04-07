import { Get, Query } from '@nestjs/common';

import { GetPopularTagsUseCase } from '../tag/application/use-cases/get-popular-tags.use-case';
import { SuggestTagsUseCase } from '../tag/application/use-cases/suggest-tags.use-case';
import { PopularTagItemDto, TagSuggestionItemDto } from '../tag/dto/response/tag-response.dto';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { ApiGetPopularFeedTagsEndpoint, ApiSuggestFeedTagsEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoTagCatalogController {
    constructor(
        private readonly getPopularTagsUseCase: GetPopularTagsUseCase,
        private readonly suggestTagsUseCase: SuggestTagsUseCase,
    ) {}

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
