import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { CompleteUploadUseCase } from './application/use-cases/complete-upload.use-case';
import { DeleteVideoUseCase } from './application/use-cases/delete-video.use-case';
import { GetMyVideosUseCase } from './application/use-cases/get-my-videos.use-case';
import { GetUploadUrlUseCase } from './application/use-cases/get-upload-url.use-case';
import { ToggleVideoVisibilityUseCase } from './application/use-cases/toggle-video-visibility.use-case';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { UploadVideoRequestDto } from './dto/request/upload-video-request.dto';
import {
    MyVideoListResponseDto,
    UploadCompleteResponseDto,
    UploadUrlResponseDto,
    VideoActionSuccessResponseDto,
    VideoVisibilityResponseDto,
} from './dto/response/video-response.dto';
import {
    ApiCompleteFeedVideoUploadEndpoint,
    ApiDeleteFeedVideoEndpoint,
    ApiGetFeedVideoUploadUrlEndpoint,
    ApiGetMyFeedVideosEndpoint,
    ApiToggleFeedVideoVisibilityEndpoint,
} from './swagger';

@FeedProtectedController()
export class FeedVideoManageController {
    constructor(
        private readonly getUploadUrlUseCase: GetUploadUrlUseCase,
        private readonly completeUploadUseCase: CompleteUploadUseCase,
        private readonly getMyVideosUseCase: GetMyVideosUseCase,
        private readonly deleteVideoUseCase: DeleteVideoUseCase,
        private readonly toggleVideoVisibilityUseCase: ToggleVideoVisibilityUseCase,
    ) {}

    @Post('videos/upload-url')
    @ApiGetFeedVideoUploadUrlEndpoint()
    async getUploadUrl(
        @CurrentUser('userId') userId: string,
        @CurrentActorType() actorType: ActorType,
        @Body() dto: UploadVideoRequestDto,
    ): Promise<UploadUrlResponseDto> {
        return this.getUploadUrlUseCase.execute(userId, actorType, dto.title, dto.description, dto.tags);
    }

    @Post('videos/:videoId/upload-complete')
    @ApiCompleteFeedVideoUploadEndpoint()
    async completeUpload(
        @Param('videoId') videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<UploadCompleteResponseDto> {
        return this.completeUploadUseCase.execute(videoId, userId);
    }

    @Get('videos/my/list')
    @ApiGetMyFeedVideosEndpoint()
    async getMyVideos(
        @CurrentUser('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<MyVideoListResponseDto> {
        return this.getMyVideosUseCase.execute(userId, Number(page), Number(limit));
    }

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
