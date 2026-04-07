import { Get, Query } from '@nestjs/common';

import { SearchByTagUseCase } from '../tag/application/use-cases/search-by-tag.use-case';
import { TagSearchResponseDto } from '../tag/dto/response/tag-response.dto';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { ApiSearchFeedVideosByTagEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoTagSearchController {
    constructor(private readonly searchByTagUseCase: SearchByTagUseCase) {}

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
