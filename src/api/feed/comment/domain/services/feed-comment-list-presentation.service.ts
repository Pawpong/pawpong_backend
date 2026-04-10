import { Injectable } from '@nestjs/common';

import {
    FeedCommentAuthorSnapshot,
    FeedCommentReplyCountSnapshot,
    FeedCommentSnapshot,
} from '../../application/ports/feed-comment-manager.port';
import type {
    FeedCommentAuthorResult,
    FeedCommentListResult,
    FeedReplyListResult,
} from '../../application/types/feed-comment-result.type';

@Injectable()
export class FeedCommentListPresentationService {
    buildCommentListResponse(
        comments: FeedCommentSnapshot[],
        totalCount: number,
        page: number,
        limit: number,
        replyCounts: FeedCommentReplyCountSnapshot[],
        userId?: string,
    ): FeedCommentListResult {
        const replyCountMap = new Map(replyCounts.map((replyCount) => [replyCount.commentId, replyCount.count]));

        return {
            comments: comments.map((comment) => ({
                commentId: comment.id,
                content: comment.content,
                author: this.toAuthorResponse(comment.author),
                likeCount: comment.likeCount,
                replyCount: replyCountMap.get(comment.id) || 0,
                createdAt: comment.createdAt,
                isOwner: userId ? comment.userId === userId : false,
            })),
            totalCount,
            hasNextPage: page < Math.ceil(totalCount / limit),
        };
    }

    buildReplyListResponse(
        replies: FeedCommentSnapshot[],
        totalCount: number,
        page: number,
        limit: number,
        userId?: string,
    ): FeedReplyListResult {
        return {
            replies: replies.map((reply) => ({
                commentId: reply.id,
                content: reply.content,
                author: this.toAuthorResponse(reply.author),
                likeCount: reply.likeCount,
                createdAt: reply.createdAt,
                isOwner: userId ? reply.userId === userId : false,
            })),
            totalCount,
            hasNextPage: page < Math.ceil(totalCount / limit),
        };
    }

    private toAuthorResponse(author: FeedCommentAuthorSnapshot | null): FeedCommentAuthorResult | null {
        if (!author) {
            return null;
        }

        return {
            _id: author.id,
            name: author.name,
            profileImageFileName: author.profileImageFileName,
            businessName: author.businessName,
        };
    }
}
