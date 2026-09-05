import { Injectable } from '@nestjs/common';

import { FeedCommentSnapshot } from '../../application/ports/feed-comment-manager.port';
import type {
    FeedCommentCreateResult,
    FeedCommentUpdateResult,
} from '../../application/types/feed-comment-result.type';

@Injectable()
export class FeedCommentCommandResultMapperService {
    toCreateResult(comment: FeedCommentSnapshot): FeedCommentCreateResult {
        return {
            commentId: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
        };
    }

    toUpdateResult(comment: FeedCommentSnapshot): FeedCommentUpdateResult {
        return {
            commentId: comment.id,
            content: comment.content,
            updatedAt: comment.updatedAt,
        };
    }
}
