import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { StorageService } from '../../../../../common/storage/storage.service';
import { FeedVideoCommandPolicyService } from '../../domain/services/feed-video-command-policy.service';
import { FEED_VIDEO_COMMAND, type FeedVideoCommandPort } from '../ports/feed-video-command.port';

@Injectable()
export class DeleteVideoUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        private readonly feedVideoCommandPolicyService: FeedVideoCommandPolicyService,
        private readonly storageService: StorageService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async execute(videoId: string, userId: string): Promise<{ success: true }> {
        const video = this.feedVideoCommandPolicyService.requireVideo(await this.feedVideoCommand.findById(videoId));
        this.feedVideoCommandPolicyService.ensureOwner(video, userId);

        await Promise.all(
            this.feedVideoCommandPolicyService
                .getRemovableFileKeys(video)
                .map((fileKey) => this.storageService.deleteFile(fileKey).catch(() => {})),
        );

        await this.feedVideoCommand.deleteById(videoId);
        await this.cacheManager.del(`video:meta:${videoId}`);

        return { success: true };
    }
}
