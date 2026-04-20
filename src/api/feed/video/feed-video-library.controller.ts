import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { GetMyVideosUseCase } from './application/use-cases/get-my-videos.use-case';
import type { FeedMyVideoListResult } from './application/types/feed-video-result.type';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { FeedPaginationQueryDto } from './dto/request/feed-pagination-query.dto';
import { MyVideoListResponseDto } from './dto/response/video-response.dto';
import { ApiGetMyFeedVideosEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoLibraryController {
    constructor(private readonly getMyVideosUseCase: GetMyVideosUseCase) {}

    @Get('videos/my/list')
    @ApiGetMyFeedVideosEndpoint()
    async getMyVideos(
        @CurrentUser('userId') userId: string,
        @Query() query: FeedPaginationQueryDto,
    ): Promise<MyVideoListResponseDto> {
        return (await this.getMyVideosUseCase.execute(userId, query.page, query.limit)) as
            MyVideoListResponseDto & FeedMyVideoListResult;
    }
}
