import { Get, Inject, Query } from '@nestjs/common';

import type { SearchFeedVideosByTagUseCasePort } from '../tag/application/ports/feed-tag-interaction.port';
import {
    SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE,
} from '../tag/application/tokens/feed-tag-interaction.token';
import type { FeedTagSearchResult } from '../tag/application/types/feed-tag-result.type';
import { FeedTagSearchQueryDto } from './dto/request/feed-tag-search-query.dto';
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
    async searchByTag(@Query() query: FeedTagSearchQueryDto): Promise<TagSearchResponseDto> {
        return (await this.searchByTagUseCase.execute(query.tag, query.page, query.limit)) as
            TagSearchResponseDto & FeedTagSearchResult;
    }
}
