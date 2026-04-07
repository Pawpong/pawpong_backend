import { Body, Param, Post } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { CompleteUploadUseCase } from './application/use-cases/complete-upload.use-case';
import { GetUploadUrlUseCase } from './application/use-cases/get-upload-url.use-case';
import { FeedProtectedController } from './decorator/feed-video-controller.decorator';
import { UploadVideoRequestDto } from './dto/request/upload-video-request.dto';
import { UploadCompleteResponseDto, UploadUrlResponseDto } from './dto/response/video-response.dto';
import { ApiCompleteFeedVideoUploadEndpoint, ApiGetFeedVideoUploadUrlEndpoint } from './swagger';

@FeedProtectedController()
export class FeedVideoUploadController {
    constructor(
        private readonly getUploadUrlUseCase: GetUploadUrlUseCase,
        private readonly completeUploadUseCase: CompleteUploadUseCase,
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
}
