import { Get, Inject, Param } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import {
    GET_FEED_VIDEO_LIKE_STATUS_USE_CASE,
    type GetFeedVideoLikeStatusUseCasePort,
} from '../like/application/ports/feed-like-interaction.port';
import { LikeStatusResponseDto } from '../like/dto/response/like-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiGetFeedVideoLikeStatusEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoLikeStatusController {
    constructor(
        @Inject(GET_FEED_VIDEO_LIKE_STATUS_USE_CASE)
        private readonly getLikeStatusUseCase: GetFeedVideoLikeStatusUseCasePort,
    ) {}

    @Get('like/:videoId/status')
    @ApiGetFeedVideoLikeStatusEndpoint()
    async getLikeStatus(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<LikeStatusResponseDto> {
        return this.getLikeStatusUseCase.execute(videoId, userId);
    }
}
