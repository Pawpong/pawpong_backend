import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FeedVideoCommandPolicyService } from '../../domain/services/feed-video-command-policy.service';
import { FEED_VIDEO_COMMAND, type FeedVideoCommandPort } from '../ports/feed-video-command.port';
import { FEED_VIDEO_FILE_STORAGE, type FeedVideoFileStoragePort } from '../ports/feed-video-file-storage.port';

@Injectable()
export class DeleteVideoUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        private readonly feedVideoCommandPolicyService: FeedVideoCommandPolicyService,
        @Inject(FEED_VIDEO_FILE_STORAGE)
        private readonly feedVideoFileStorage: FeedVideoFileStoragePort,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(videoId: string, userId: string): Promise<{ success: true }> {
        const video = this.feedVideoCommandPolicyService.requireVideo(await this.feedVideoCommand.findById(videoId));
        this.feedVideoCommandPolicyService.ensureOwner(video, userId);

        await Promise.all(
            this.feedVideoCommandPolicyService
                .getRemovableFileKeys(video)
                .map((fileKey) => this.feedVideoFileStorage.deleteFile(fileKey).catch(() => {})),
        );

        await this.feedVideoCommand.deleteById(videoId);
        await this.cacheManager.del(this.feedCacheKeyService.getVideoMetaKey(videoId));

        return { success: true };
    }
}
