import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES } from '../constants/feed-video-response-messages';
import { Get, Param } from '@nestjs/common';

import { MongoObjectIdPipe } from '../../../../../common/pipe/mongo-object-id.pipe';
import { GetVideoMetaUseCase } from '../application/use-cases/get-video-meta.use-case';
import type { FeedVideoMetaQueryResult } from '../application/types/feed-video-result.type';
import { FeedPublicController } from '../decorator/feed-video-controller.decorator';
import { PendingVideoMetaResponseDto, VideoMetaResponseDto } from '../dto/response/video-response.dto';
import { ApiGetFeedVideoMetaEndpoint } from '../swagger/index';

@FeedPublicController()
export class FeedVideoDetailController {
    constructor(private readonly getVideoMetaUseCase: GetVideoMetaUseCase) {}

    @Get('videos/:videoId')
    @ApiGetFeedVideoMetaEndpoint()
    async getVideoMeta(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
    ): Promise<ApiResponseDto<VideoMetaResponseDto | PendingVideoMetaResponseDto>> {
        return ApiResponseDto.success(
            (await this.getVideoMetaUseCase.execute(videoId)) as
                | (VideoMetaResponseDto & FeedVideoMetaQueryResult)
                | (PendingVideoMetaResponseDto & FeedVideoMetaQueryResult),
            FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.videoMetaRetrieved,
        );
    }
}
