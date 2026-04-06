import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedVideoCommandPolicyService } from '../../domain/services/feed-video-command-policy.service';
import { FEED_VIDEO_COMMAND, type FeedVideoCommandPort } from '../ports/feed-video-command.port';

@Injectable()
export class ToggleVideoVisibilityUseCase {
    constructor(
        @Inject(FEED_VIDEO_COMMAND)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        private readonly feedVideoCommandPolicyService: FeedVideoCommandPolicyService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async execute(videoId: string, userId: string): Promise<{ isPublic: boolean }> {
        const video = this.feedVideoCommandPolicyService.requireVideo(await this.feedVideoCommand.findById(videoId));
        this.feedVideoCommandPolicyService.ensureOwner(video, userId);

        const isPublic = this.feedVideoCommandPolicyService.getNextVisibility(video);
        await this.feedVideoCommand.updateVisibility(videoId, isPublic);
        await this.cacheManager.del(`video:meta:${videoId}`);

        return { isPublic };
    }
}
