import { Get, Param } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { GetLikeStatusUseCase } from '../like/application/use-cases/get-like-status.use-case';
import { LikeStatusResponseDto } from '../like/dto/response/like-response.dto';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { ApiGetFeedVideoLikeStatusEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoLikeStatusController {
    constructor(private readonly getLikeStatusUseCase: GetLikeStatusUseCase) {}

    @Get('like/:videoId/status')
    @ApiGetFeedVideoLikeStatusEndpoint()
    async getLikeStatus(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<LikeStatusResponseDto> {
        return this.getLikeStatusUseCase.execute(videoId, userId);
    }
}
