import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES } from '../constants/feed-video-response-messages';
import { Delete, Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../../../../common/decorator/current-user.decorator';
import { MongoObjectIdPipe } from '../../../../../common/pipe/mongo-object-id.pipe';
import { DeleteVideoUseCase } from '../application/use-cases/delete-video.use-case';
import { ToggleVideoVisibilityUseCase } from '../application/use-cases/toggle-video-visibility.use-case';
import { FeedProtectedController } from '../decorator/feed-video-controller.decorator';
import { VideoActionSuccessResponseDto, VideoVisibilityResponseDto } from '../dto/response/video-response.dto';
import { ApiDeleteFeedVideoEndpoint, ApiToggleFeedVideoVisibilityEndpoint } from '../swagger/index';

@FeedProtectedController()
export class FeedVideoOwnershipController {
    constructor(
        private readonly deleteVideoUseCase: DeleteVideoUseCase,
        private readonly toggleVideoVisibilityUseCase: ToggleVideoVisibilityUseCase,
    ) {}

    @Delete('videos/:videoId')
    @ApiDeleteFeedVideoEndpoint()
    async deleteVideo(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<VideoActionSuccessResponseDto>> {
        return ApiResponseDto.success(
            await this.deleteVideoUseCase.execute(videoId, userId),
            FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.videoDeleted,
        );
    }

    @Patch('videos/:videoId/visibility')
    @ApiToggleFeedVideoVisibilityEndpoint()
    async toggleVisibility(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<VideoVisibilityResponseDto>> {
        return ApiResponseDto.success(
            await this.toggleVideoVisibilityUseCase.execute(videoId, userId),
            FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.visibilityToggled,
        );
    }
}
