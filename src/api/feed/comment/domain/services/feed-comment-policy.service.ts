import { BadRequestException, Injectable } from '@nestjs/common';

import { FeedCommentSnapshot } from '../../application/ports/feed-comment-manager.port';

@Injectable()
export class FeedCommentPolicyService {
    requireVideo(video: { id: string } | null): { id: string } {
        if (!video) {
            throw new BadRequestException('동영상을 찾을 수 없습니다.');
        }

        return video;
    }

    requireComment(comment: FeedCommentSnapshot | null, message: string = '댓글을 찾을 수 없습니다.'): FeedCommentSnapshot {
        if (!comment) {
            throw new BadRequestException(message);
        }

        return comment;
    }

    ensureParentMatchesVideo(comment: FeedCommentSnapshot, videoId: string): void {
        if (comment.videoId !== videoId) {
            throw new BadRequestException('부모 댓글을 찾을 수 없습니다.');
        }
    }

    ensureOwner(comment: FeedCommentSnapshot, userId: string): void {
        if (comment.userId !== userId) {
            throw new BadRequestException('권한이 없습니다.');
        }
    }
}
