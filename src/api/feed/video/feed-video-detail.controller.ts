import { Get, Param } from '@nestjs/common';

import { GetVideoMetaUseCase } from './application/use-cases/get-video-meta.use-case';
import type { FeedVideoMetaQueryResult } from './application/types/feed-video-result.type';
import { FeedPublicController } from './decorator/feed-video-controller.decorator';
import { PendingVideoMetaResponseDto, VideoMetaResponseDto } from './dto/response/video-response.dto';
import { ApiGetFeedVideoMetaEndpoint } from './swagger';

@FeedPublicController()
export class FeedVideoDetailController {
    constructor(private readonly getVideoMetaUseCase: GetVideoMetaUseCase) {}

    @Get('videos/:videoId')
    @ApiGetFeedVideoMetaEndpoint()
    async getVideoMeta(@Param('videoId') videoId: string): Promise<VideoMetaResponseDto | PendingVideoMetaResponseDto> {
        return (await this.getVideoMetaUseCase.execute(videoId)) as
            | (VideoMetaResponseDto & FeedVideoMetaQueryResult)
            | (PendingVideoMetaResponseDto & FeedVideoMetaQueryResult);
    }
}
