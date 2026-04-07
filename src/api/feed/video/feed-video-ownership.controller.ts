import { Delete, Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { DeleteVideoUseCase } from './application/use-cases/delete-video.use-case';
import { ToggleVideoVisibilityUseCase } from './application/use-cases/toggle-video-visibility.use-case';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { VideoActionSuccessResponseDto, VideoVisibilityResponseDto } from './dto/response/video-response.dto';
import { ApiDeleteFeedVideoEndpoint, ApiToggleFeedVideoVisibilityEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoOwnershipController {
    constructor(
        private readonly deleteVideoUseCase: DeleteVideoUseCase,
        private readonly toggleVideoVisibilityUseCase: ToggleVideoVisibilityUseCase,
    ) {}

    @Delete('videos/:videoId')
    @ApiDeleteFeedVideoEndpoint()
    async deleteVideo(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<VideoActionSuccessResponseDto> {
        return this.deleteVideoUseCase.execute(videoId, userId);
    }

    @Patch('videos/:videoId/visibility')
    @ApiToggleFeedVideoVisibilityEndpoint()
    async toggleVisibility(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<VideoVisibilityResponseDto> {
        return this.toggleVideoVisibilityUseCase.execute(videoId, userId);
    }
}
