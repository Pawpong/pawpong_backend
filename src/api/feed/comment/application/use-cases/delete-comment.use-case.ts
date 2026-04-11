import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FeedCommentPolicyService } from '../../domain/services/feed-comment-policy.service';
import { FEED_COMMENT_MANAGER_PORT, type FeedCommentManagerPort } from '../ports/feed-comment-manager.port';

@Injectable()
export class DeleteCommentUseCase {
    constructor(
        @Inject(FEED_COMMENT_MANAGER_PORT)
        private readonly feedCommentManager: FeedCommentManagerPort,
        private readonly feedCommentPolicyService: FeedCommentPolicyService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(commentId: string, userId: string) {
        const comment = this.feedCommentPolicyService.requireComment(await this.feedCommentManager.findComment(commentId));
        this.feedCommentPolicyService.ensureOwner(comment, userId);

        await this.feedCommentManager.markDeleted(commentId);
        await this.feedCommentManager.incrementVideoCommentCount(comment.videoId, -1);
        await this.cacheManager.del(this.feedCacheKeyService.getVideoMetaKey(comment.videoId));
        await this.cacheManager.del(this.feedCacheKeyService.getVideoCommentsKey(comment.videoId));

        return { success: true };
    }
}
