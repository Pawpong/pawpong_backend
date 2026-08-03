import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES } from '../constants/feed-video-response-messages';
import { HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { MongoObjectIdPipe } from '../../../../../common/pipe/mongo-object-id.pipe';
import { IncrementViewCountUseCase } from '../application/use-cases/increment-view-count.use-case';
import { FeedPublicController } from '../decorator/feed-video-controller.decorator';
import { VideoActionSuccessResponseDto } from '../dto/response/video-response.dto';
import { ApiIncrementFeedVideoViewEndpoint } from '../swagger/index';

@FeedPublicController()
export class FeedVideoViewController {
    constructor(private readonly incrementViewCountUseCase: IncrementViewCountUseCase) {}

    @Post('videos/:videoId/view')
    @HttpCode(HttpStatus.OK)
    @ApiIncrementFeedVideoViewEndpoint()
    async incrementView(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
    ): Promise<ApiResponseDto<VideoActionSuccessResponseDto>> {
        await this.incrementViewCountUseCase.execute(videoId);
        return ApiResponseDto.success({ success: true }, FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.videoViewIncremented);
    }
}
