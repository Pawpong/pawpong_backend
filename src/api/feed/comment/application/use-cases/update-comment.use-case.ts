import { Inject, Injectable } from '@nestjs/common';

import { FeedCommentCommandResponseService } from '../../domain/services/feed-comment-command-response.service';
import { FeedCommentPolicyService } from '../../domain/services/feed-comment-policy.service';
import { FEED_COMMENT_MANAGER_PORT, type FeedCommentManagerPort } from '../ports/feed-comment-manager.port';

@Injectable()
export class UpdateCommentUseCase {
    constructor(
        @Inject(FEED_COMMENT_MANAGER_PORT)
        private readonly feedCommentManager: FeedCommentManagerPort,
        private readonly feedCommentPolicyService: FeedCommentPolicyService,
        private readonly feedCommentCommandResponseService: FeedCommentCommandResponseService,
    ) {}

    async execute(commentId: string, userId: string, content: string) {
        const comment = this.feedCommentPolicyService.requireComment(await this.feedCommentManager.findComment(commentId));
        this.feedCommentPolicyService.ensureOwner(comment, userId);

        const updatedComment = this.feedCommentPolicyService.requireComment(
            await this.feedCommentManager.updateCommentContent(commentId, content),
        );

        return this.feedCommentCommandResponseService.buildUpdateResponse(updatedComment);
    }
}
