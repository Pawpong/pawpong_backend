import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { GetMyVideosUseCase } from './application/use-cases/get-my-videos.use-case';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { MyVideoListResponseDto } from './dto/response/video-response.dto';
import { ApiGetMyFeedVideosEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoLibraryController {
    constructor(private readonly getMyVideosUseCase: GetMyVideosUseCase) {}

    @Get('videos/my/list')
    @ApiGetMyFeedVideosEndpoint()
    async getMyVideos(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<MyVideoListResponseDto> {
        return this.getMyVideosUseCase.execute(userId, Number(page), Number(limit));
    }
}
