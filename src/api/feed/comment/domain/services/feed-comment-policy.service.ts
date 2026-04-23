import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';
import { FeedCommentSnapshot } from '../../application/ports/feed-comment-manager.port';

@Injectable()
export class FeedCommentPolicyService {
    requireVideo(video: { id: string } | null): { id: string } {
        if (!video) {
            throw new DomainValidationError('동영상을 찾을 수 없습니다.');
        }

        return video;
    }

    requireComment(
        comment: FeedCommentSnapshot | null,
        message: string = '댓글을 찾을 수 없습니다.',
    ): FeedCommentSnapshot {
        if (!comment) {
            throw new DomainValidationError(message);
        }

        return comment;
    }

    ensureParentMatchesVideo(comment: FeedCommentSnapshot, videoId: string): void {
        if (comment.videoId !== videoId) {
            throw new DomainValidationError('부모 댓글을 찾을 수 없습니다.');
        }
    }

    ensureOwner(comment: FeedCommentSnapshot, userId: string): void {
        if (comment.userId !== userId) {
            throw new DomainValidationError('권한이 없습니다.');
        }
    }
}
