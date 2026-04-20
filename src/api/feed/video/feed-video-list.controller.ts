import { Get, Query } from '@nestjs/common';

import { GetFeedUseCase } from './application/use-cases/get-feed.use-case';
import type { FeedVideoFeedResult } from './application/types/feed-video-result.type';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { FeedPaginationQueryDto } from './dto/request/feed-pagination-query.dto';
import { FeedResponseDto } from './dto/response/video-response.dto';
import { ApiGetFeedVideosEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoListController {
    constructor(private readonly getFeedUseCase: GetFeedUseCase) {}

    @Get('videos')
    @ApiGetFeedVideosEndpoint()
    async getFeed(@Query() query: FeedPaginationQueryDto): Promise<FeedResponseDto> {
        return (await this.getFeedUseCase.execute(query.page, query.limit)) as FeedResponseDto & FeedVideoFeedResult;
    }
}
