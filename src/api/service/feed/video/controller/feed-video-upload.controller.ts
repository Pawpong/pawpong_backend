import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES } from '../constants/feed-video-response-messages';
import { Body, Param, Post } from '@nestjs/common';

import { CurrentActorType, type ActorType } from '../../../../../common/decorator/current-actor-type.decorator';
import { CurrentUser } from '../../../../../common/decorator/current-user.decorator';
import { MongoObjectIdPipe } from '../../../../../common/pipe/mongo-object-id.pipe';
import { CompleteUploadUseCase } from '../application/use-cases/complete-upload.use-case';
import { GetUploadUrlUseCase } from '../application/use-cases/get-upload-url.use-case';
import type { FeedVideoUploadUrlResult } from '../application/types/feed-video-result.type';
import { FeedProtectedController } from '../decorator/feed-video-controller.decorator';
import { UploadVideoRequestDto } from '../dto/request/upload-video-request.dto';
import { UploadCompleteResponseDto, UploadUrlResponseDto } from '../dto/response/video-response.dto';
import { ApiCompleteFeedVideoUploadEndpoint, ApiGetFeedVideoUploadUrlEndpoint } from '../swagger/index';

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
    ): Promise<ApiResponseDto<UploadUrlResponseDto>> {
        return ApiResponseDto.success(
            (await this.getUploadUrlUseCase.execute(
            userId,
            actorType,
            dto.title,
            dto.description,
            dto.tags,
        )) as UploadUrlResponseDto & FeedVideoUploadUrlResult,
            FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.uploadUrlIssued,
        );
    }

    @Post('videos/:videoId/upload-complete')
    @ApiCompleteFeedVideoUploadEndpoint()
    async completeUpload(
        @Param('videoId', new MongoObjectIdPipe('영상')) videoId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<UploadCompleteResponseDto>> {
        return ApiResponseDto.success(
            await this.completeUploadUseCase.execute(videoId, userId),
            FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES.uploadCompleted,
        );
    }
}
