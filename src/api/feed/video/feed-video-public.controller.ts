import { Get, Param, Post, Query } from '@nestjs/common';

import { GetFeedUseCase } from './application/use-cases/get-feed.use-case';
import { GetPopularVideosUseCase } from './application/use-cases/get-popular-videos.use-case';
import { GetVideoMetaUseCase } from './application/use-cases/get-video-meta.use-case';
import { IncrementViewCountUseCase } from './application/use-cases/increment-view-count.use-case';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import {
    FeedResponseDto,
    PendingVideoMetaResponseDto,
    PopularVideoItemDto,
    VideoActionSuccessResponseDto,
    VideoMetaResponseDto,
} from './dto/response/video-response.dto';
import {
    ApiGetFeedVideoMetaEndpoint,
    ApiGetFeedVideosEndpoint,
    ApiGetPopularFeedVideosEndpoint,
    ApiIncrementFeedVideoViewEndpoint,
} from './swagger';

@FeedPublicController()
export class FeedVideoPublicController {
    constructor(
        private readonly getFeedUseCase: GetFeedUseCase,
        private readonly getPopularVideosUseCase: GetPopularVideosUseCase,
        private readonly getVideoMetaUseCase: GetVideoMetaUseCase,
        private readonly incrementViewCountUseCase: IncrementViewCountUseCase,
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

    @Get('videos/:videoId')
    @ApiGetFeedVideoMetaEndpoint()
    async getVideoMeta(@Param('videoId') videoId: string): Promise<VideoMetaResponseDto | PendingVideoMetaResponseDto> {
        return this.getVideoMetaUseCase.execute(videoId);
    }

    @Post('videos/:videoId/view')
    @ApiIncrementFeedVideoViewEndpoint()
    async incrementView(@Param('videoId') videoId: string): Promise<VideoActionSuccessResponseDto> {
        await this.incrementViewCountUseCase.execute(videoId);
        return { success: true };
    }
}
