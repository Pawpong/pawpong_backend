import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { FEED_VIDEO_COMMAND_PORT, type FeedVideoCommandPort } from '../ports/feed-video-command.port';
import { FEED_VIDEO_FILE_STORAGE_PORT, type FeedVideoFileStoragePort } from '../ports/feed-video-file-storage.port';
import type { FeedVideoUploadUrlResult } from '../types/feed-video-result.type';

@Injectable()
export class GetUploadUrlUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND_PORT)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        @Inject(FEED_VIDEO_FILE_STORAGE_PORT)
        private readonly feedVideoFileStorage: FeedVideoFileStoragePort,
    ) {}

    async execute(
        userId: string,
        uploaderModel: 'Breeder' | 'Adopter',
        title: string,
        description?: string,
        tags?: string[],
    ): Promise<FeedVideoUploadUrlResult> {
        const videoKey = `videos/raw/${randomUUID()}.mp4`;
        const uploadUrl = await this.feedVideoFileStorage.generatePresignedUploadUrl(videoKey, 600);
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
