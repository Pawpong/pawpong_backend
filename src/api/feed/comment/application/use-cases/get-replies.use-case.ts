import { Inject, Injectable } from '@nestjs/common';

import { FeedCommentListPresentationService } from '../../domain/services/feed-comment-list-presentation.service';
import { FEED_COMMENT_MANAGER, type FeedCommentManagerPort } from '../ports/feed-comment-manager.port';

@Injectable()
export class GetRepliesUseCase {
    constructor(
        @Inject(FEED_COMMENT_MANAGER)
        private readonly feedCommentManager: FeedCommentManagerPort,
        private readonly feedCommentListPresentationService: FeedCommentListPresentationService,
    ) {}

    async execute(commentId: string, userId?: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [replies, totalCount] = await Promise.all([
            this.feedCommentManager.readReplies(commentId, skip, limit),
            this.feedCommentManager.countReplies(commentId),
        ]);

        return this.feedCommentListPresentationService.buildReplyListResponse(replies, totalCount, page, limit, userId);
    }
}
