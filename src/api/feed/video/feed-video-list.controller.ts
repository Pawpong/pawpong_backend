import { Get, Query } from '@nestjs/common';

import { GetFeedUseCase } from './application/use-cases/get-feed.use-case';
import type { FeedVideoFeedResult } from './application/types/feed-video-result.type';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { FeedResponseDto } from './dto/response/video-response.dto';
import { ApiGetFeedVideosEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoListController {
    constructor(private readonly getFeedUseCase: GetFeedUseCase) {}

    @Get('videos')
    @ApiGetFeedVideosEndpoint()
    async getFeed(@Query('page') page: number = 1, @Query('limit') limit: number = 20): Promise<FeedResponseDto> {
        return (await this.getFeedUseCase.execute(Number(page), Number(limit))) as FeedResponseDto & FeedVideoFeedResult;
    }
}
