import { Inject, Injectable } from '@nestjs/common';

import { FeedCommentPresentationService } from '../../domain/services/feed-comment-presentation.service';
import { FeedCommentPolicyService } from '../../domain/services/feed-comment-policy.service';
import { FEED_COMMENT_MANAGER, type FeedCommentManagerPort } from '../ports/feed-comment-manager.port';

@Injectable()
export class UpdateCommentUseCase {
    constructor(
        @Inject(FEED_COMMENT_MANAGER)
        private readonly feedCommentManager: FeedCommentManagerPort,
        private readonly feedCommentPolicyService: FeedCommentPolicyService,
        private readonly feedCommentPresentationService: FeedCommentPresentationService,
    ) {}

    async execute(commentId: string, userId: string, content: string) {
        const comment = this.feedCommentPolicyService.requireComment(await this.feedCommentManager.findComment(commentId));
        this.feedCommentPolicyService.ensureOwner(comment, userId);

        const updatedComment = this.feedCommentPolicyService.requireComment(
            await this.feedCommentManager.updateCommentContent(commentId, content),
        );

        return this.feedCommentPresentationService.buildUpdateResponse(updatedComment);
    }
}
