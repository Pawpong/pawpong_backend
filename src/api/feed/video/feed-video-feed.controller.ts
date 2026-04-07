import { Get, Query } from '@nestjs/common';

import { GetFeedUseCase } from './application/use-cases/get-feed.use-case';
import { GetPopularVideosUseCase } from './application/use-cases/get-popular-videos.use-case';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { FeedResponseDto, PopularVideoItemDto } from './dto/response/video-response.dto';
import { ApiGetFeedVideosEndpoint, ApiGetPopularFeedVideosEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoFeedController {
    constructor(
        private readonly getFeedUseCase: GetFeedUseCase,
        private readonly getPopularVideosUseCase: GetPopularVideosUseCase,
    ) {}

    @Get('videos')
    @ApiGetFeedVideosEndpoint()
    async getFeed(@Query('page') page: number = 1, @Query('limit') limit: number = 20): Promise<FeedResponseDto> {
        return this.getFeedUseCase.execute(Number(page), Number(limit));
    }

    @Get('videos/popular')
    @ApiGetPopularFeedVideosEndpoint()
    async getPopularVideos(@Query('limit') limit: number = 10): Promise<PopularVideoItemDto[]> {
        return this.getPopularVideosUseCase.execute(Number(limit));
    }
}
