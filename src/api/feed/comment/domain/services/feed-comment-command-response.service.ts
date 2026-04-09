import { Injectable } from '@nestjs/common';

import { FeedCommentSnapshot } from '../../application/ports/feed-comment-manager.port';

@Injectable()
export class FeedCommentCommandResponseService {
    buildCreateResponse(comment: FeedCommentSnapshot) {
        return {
            commentId: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
        };
    }

    buildUpdateResponse(comment: FeedCommentSnapshot) {
        return {
            commentId: comment.id,
            content: comment.content,
            updatedAt: comment.updatedAt,
        };
    }
}
