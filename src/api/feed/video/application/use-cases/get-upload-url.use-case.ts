import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { StorageService } from '../../../../../common/storage/storage.service';
import { UploadUrlResponseDto } from '../../dto/response/video-response.dto';
import { FEED_VIDEO_COMMAND, type FeedVideoCommandPort } from '../ports/feed-video-command.port';

@Injectable()
export class GetUploadUrlUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        private readonly storageService: StorageService,
    ) {}

    async execute(
        userId: string,
        uploaderModel: 'Breeder' | 'Adopter',
        title: string,
        description?: string,
        tags?: string[],
    ): Promise<UploadUrlResponseDto> {
        const videoKey = `videos/raw/${randomUUID()}.mp4`;
        const uploadUrl = await this.storageService.generatePresignedUploadUrl(videoKey, 600);
        const result = await this.feedVideoCommand.createPendingVideo({
            userId,
            uploaderModel,
            title,
            description,
            tags: tags || [],
            originalKey: videoKey,
        });

        return {
            videoId: result.videoId,
            uploadUrl,
            videoKey,
        };
    }
}
