import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

import { getErrorStack } from '../../../../../common/utils/error.util';
import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FEED_VIDEO_COMMAND_PORT, type FeedVideoCommandPort } from '../ports/feed-video-command.port';

@Injectable()
export class IncrementViewCountUseCase {
    private readonly logger = new Logger(IncrementViewCountUseCase.name);

    constructor(
        @Inject(FEED_VIDEO_COMMAND_PORT)
        private readonly feedVideoCommand: FeedVideoCommandPort,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(videoId: string): Promise<void> {
        void this.feedVideoCommand.incrementViewCount(videoId).catch((error) => {
            this.logger.error(`[incrementViewCount] 조회수 증가 실패 - videoId: ${videoId}`, getErrorStack(error));
        });

        await this.cacheManager.del(this.feedCacheKeyService.getVideoMetaKey(videoId));
    }
}
