import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FEED_VIDEO_COMMAND, type FeedVideoCommandPort } from '../ports/feed-video-command.port';

@Injectable()
export class IncrementViewCountUseCase {
    private readonly logger = new Logger(IncrementViewCountUseCase.name);

    constructor(
        @Inject(FEED_VIDEO_COMMAND)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(videoId: string): Promise<void> {
        void this.feedVideoCommand.incrementViewCount(videoId).catch((error) => {
            const trace = error instanceof Error ? error.stack : undefined;
            this.logger.error(`[incrementViewCount] 조회수 증가 실패 - videoId: ${videoId}`, trace);
        });

        await this.cacheManager.del(this.feedCacheKeyService.getVideoMetaKey(videoId));
    }
}
