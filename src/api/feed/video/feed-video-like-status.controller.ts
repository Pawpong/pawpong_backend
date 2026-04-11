import { Get, Inject, Param } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import type { GetFeedVideoLikeStatusUseCasePort } from '../like/application/ports/feed-like-interaction.port';
import {
    GET_FEED_VIDEO_LIKE_STATUS_USE_CASE,
} from '../like/application/tokens/feed-like-interaction.token';
import type { FeedLikeStatusResult } from '../like/application/types/feed-like-result.type';
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
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<LikeStatusResponseDto> {
        return (await this.getLikeStatusUseCase.execute(videoId, userId)) as
            LikeStatusResponseDto & FeedLikeStatusResult;
    }
}
