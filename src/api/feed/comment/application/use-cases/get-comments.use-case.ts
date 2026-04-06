import { Inject, Injectable } from '@nestjs/common';

import { FeedCommentPresentationService } from '../../domain/services/feed-comment-presentation.service';
import { FEED_COMMENT_MANAGER, type FeedCommentManagerPort } from '../ports/feed-comment-manager.port';

@Injectable()
export class GetCommentsUseCase {
    constructor(
        @Inject(FEED_COMMENT_MANAGER)
        private readonly feedCommentManager: FeedCommentManagerPort,
        private readonly feedCommentPresentationService: FeedCommentPresentationService,
    ) {}

    async execute(videoId: string, userId?: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [comments, totalCount] = await Promise.all([
            this.feedCommentManager.readRootComments(videoId, skip, limit),
            this.feedCommentManager.countRootComments(videoId),
        ]);

        const replyCounts = await this.feedCommentManager.readReplyCounts(comments.map((comment) => comment.id));
        return this.feedCommentPresentationService.buildCommentListResponse(
            comments,
            totalCount,
            page,
            limit,
            replyCounts,
            userId,
        );
    }
}
