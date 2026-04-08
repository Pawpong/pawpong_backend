import { Param, Post } from '@nestjs/common';

import { IncrementViewCountUseCase } from './application/use-cases/increment-view-count.use-case';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { VideoActionSuccessResponseDto } from './dto/response/video-response.dto';
import { ApiIncrementFeedVideoViewEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoViewController {
    constructor(private readonly incrementViewCountUseCase: IncrementViewCountUseCase) {}

    @Post('videos/:videoId/view')
    @ApiIncrementFeedVideoViewEndpoint()
    async incrementView(@Param('videoId') videoId: string): Promise<VideoActionSuccessResponseDto> {
        await this.incrementViewCountUseCase.execute(videoId);
        return { success: true };
    }
}
