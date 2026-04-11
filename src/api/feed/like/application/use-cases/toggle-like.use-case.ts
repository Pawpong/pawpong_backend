import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FeedLikePresentationService } from '../../domain/services/feed-like-presentation.service';
import { FeedLikePolicyService } from '../../domain/services/feed-like-policy.service';
import { FEED_LIKE_MANAGER_PORT, type FeedLikeManagerPort } from '../ports/feed-like-manager.port';

@Injectable()
export class ToggleLikeUseCase {
    constructor(
        @Inject(FEED_LIKE_MANAGER_PORT)
        private readonly feedLikeManager: FeedLikeManagerPort,
        private readonly feedLikePolicyService: FeedLikePolicyService,
        private readonly feedLikePresentationService: FeedLikePresentationService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(videoId: string, userId: string, userModel: 'Breeder' | 'Adopter') {
        this.feedLikePolicyService.requireVideo(await this.feedLikeManager.findVideoCounter(videoId));

        const existingLike = await this.feedLikeManager.findUserLike(videoId, userId);
        const likeCount = existingLike
            ? await this.cancelLike(existingLike.id, videoId)
            : await this.addLike(videoId, userId, userModel);

        await this.cacheManager.del(this.feedCacheKeyService.getVideoMetaKey(videoId));

        return this.feedLikePresentationService.buildToggleResponse(!existingLike, likeCount);
    }

    private async addLike(videoId: string, userId: string, userModel: 'Breeder' | 'Adopter'): Promise<number> {
        await this.feedLikeManager.createLike({ videoId, userId, userModel });
        return this.feedLikeManager.updateVideoLikeCount(videoId, 1);
    }

    private async cancelLike(likeId: string, videoId: string): Promise<number> {
        await this.feedLikeManager.deleteLike(likeId);
        return this.feedLikeManager.updateVideoLikeCount(videoId, -1);
    }
}
