import { Get, Param, Post } from '@nestjs/common';

import { GetVideoMetaUseCase } from './application/use-cases/get-video-meta.use-case';
import { IncrementViewCountUseCase } from './application/use-cases/increment-view-count.use-case';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import {
    PendingVideoMetaResponseDto,
    VideoActionSuccessResponseDto,
    VideoMetaResponseDto,
} from './dto/response/video-response.dto';
import { ApiGetFeedVideoMetaEndpoint, ApiIncrementFeedVideoViewEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoMetaController {
    constructor(
        private readonly getVideoMetaUseCase: GetVideoMetaUseCase,
        private readonly incrementViewCountUseCase: IncrementViewCountUseCase,
    ) {}

    @Get('videos/:videoId')
    @ApiGetFeedVideoMetaEndpoint()
    async getVideoMeta(@Param('videoId') videoId: string): Promise<VideoMetaResponseDto | PendingVideoMetaResponseDto> {
        return this.getVideoMetaUseCase.execute(videoId);
    }

    @Post('videos/:videoId/view')
    @ApiIncrementFeedVideoViewEndpoint()
    async incrementView(@Param('videoId') videoId: string): Promise<VideoActionSuccessResponseDto> {
        await this.incrementViewCountUseCase.execute(videoId);
        return { success: true };
    }
}
