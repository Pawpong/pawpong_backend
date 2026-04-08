import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';
import { FeedCommentPresentationService } from '../../domain/services/feed-comment-presentation.service';
import { FeedCommentPolicyService } from '../../domain/services/feed-comment-policy.service';
import { FEED_COMMENT_MANAGER, type FeedCommentManagerPort } from '../ports/feed-comment-manager.port';

@Injectable()
export class CreateCommentUseCase {
    constructor(
        @Inject(FEED_COMMENT_MANAGER)
        private readonly feedCommentManager: FeedCommentManagerPort,
        private readonly feedCommentPolicyService: FeedCommentPolicyService,
        private readonly feedCommentPresentationService: FeedCommentPresentationService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly feedCacheKeyService: FeedCacheKeyService,
    ) {}

    async execute(
        videoId: string,
        userId: string,
        userModel: 'Breeder' | 'Adopter',
        content: string,
        parentId?: string,
    ) {
        this.feedCommentPolicyService.requireVideo(await this.feedCommentManager.findVideo(videoId));

        if (parentId) {
            const parentComment = this.feedCommentPolicyService.requireComment(
                await this.feedCommentManager.findComment(parentId),
                '부모 댓글을 찾을 수 없습니다.',
            );
            this.feedCommentPolicyService.ensureParentMatchesVideo(parentComment, videoId);
        }

        const comment = await this.feedCommentManager.createComment({
            videoId,
            userId,
            userModel,
            content,
            parentId,
        });

        await this.feedCommentManager.incrementVideoCommentCount(videoId, 1);
        await this.cacheManager.del(this.feedCacheKeyService.getVideoMetaKey(videoId));
        await this.cacheManager.del(this.feedCacheKeyService.getVideoCommentsKey(videoId));

        return this.feedCommentPresentationService.buildCreateResponse(comment);
    }
}
