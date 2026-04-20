import { Inject, Injectable } from '@nestjs/common';

import { FeedCommentPageAssemblerService } from '../../domain/services/feed-comment-page-assembler.service';
import { FEED_COMMENT_MANAGER_PORT, type FeedCommentManagerPort } from '../ports/feed-comment-manager.port';

@Injectable()
export class GetRepliesUseCase {
    constructor(
        @Inject(FEED_COMMENT_MANAGER_PORT)
        private readonly feedCommentManager: FeedCommentManagerPort,
        private readonly feedCommentPageAssemblerService: FeedCommentPageAssemblerService,
    ) {}

    async execute(commentId: string, userId?: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [replies, totalCount] = await Promise.all([
            this.feedCommentManager.readReplies(commentId, skip, limit),
            this.feedCommentManager.countReplies(commentId),
        ]);

        return this.feedCommentPageAssemblerService.buildReplyPage(replies, totalCount, page, limit, userId);
    }
}
