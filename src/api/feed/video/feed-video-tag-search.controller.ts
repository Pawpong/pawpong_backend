import { Get, Inject, Query } from '@nestjs/common';

import {
    SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE,
    type SearchFeedVideosByTagUseCasePort,
} from '../tag/application/ports/feed-tag-interaction.port';
import { TagSearchResponseDto } from '../tag/dto/response/tag-response.dto';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { ApiSearchFeedVideosByTagEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoTagSearchController {
    constructor(
        @Inject(SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE)
        private readonly searchByTagUseCase: SearchFeedVideosByTagUseCasePort,
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
}
