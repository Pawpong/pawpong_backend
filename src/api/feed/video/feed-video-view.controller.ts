import { Param, Post } from '@nestjs/common';

import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { IncrementViewCountUseCase } from './application/use-cases/increment-view-count.use-case';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { VideoActionSuccessResponseDto } from './dto/response/video-response.dto';
import { ApiIncrementFeedVideoViewEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoViewController {
    constructor(private readonly incrementViewCountUseCase: IncrementViewCountUseCase) {}

    @Post('videos/:videoId/view')
    @ApiIncrementFeedVideoViewEndpoint()
    async incrementView(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
    ): Promise<VideoActionSuccessResponseDto> {
        await this.incrementViewCountUseCase.execute(videoId);
        return { success: true };
    }
}
