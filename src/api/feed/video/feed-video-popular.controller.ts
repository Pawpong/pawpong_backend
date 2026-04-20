import { Get, Query } from '@nestjs/common';

import { GetPopularVideosUseCase } from './application/use-cases/get-popular-videos.use-case';
import type { FeedPopularVideoItemResult } from './application/types/feed-video-result.type';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { FeedPopularLimitQueryDto } from './dto/request/feed-limit-query.dto';
import { PopularVideoItemDto } from './dto/response/video-response.dto';
import { ApiGetPopularFeedVideosEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoPopularController {
    constructor(private readonly getPopularVideosUseCase: GetPopularVideosUseCase) {}

    @Get('videos/popular')
    @ApiGetPopularFeedVideosEndpoint()
    async getPopularVideos(@Query() query: FeedPopularLimitQueryDto): Promise<PopularVideoItemDto[]> {
        return (await this.getPopularVideosUseCase.execute(query.limit)) as Array<
            PopularVideoItemDto & FeedPopularVideoItemResult
        >;
    }
}
