import { Injectable } from '@nestjs/common';
import { FeedCommentRepository } from '../repository/feed-comment.repository';
import {
    FeedCommentManagerPort,
    FeedCommentReplyCountSnapshot,
    FeedCommentSnapshot,
} from '../application/ports/feed-comment-manager.port';
import type { FeedCommentDocumentRecord, FeedUploaderDocumentRecord } from '../../types/feed-document.type';

@Injectable()
export class FeedCommentMongooseManagerAdapter implements FeedCommentManagerPort {
    constructor(private readonly feedCommentRepository: FeedCommentRepository) {}

    async findVideo(videoId: string): Promise<{ id: string } | null> {
        const video = await this.feedCommentRepository.findVideoById(videoId);
        return video ? { id: video._id.toString() } : null;
    }

    async findComment(commentId: string): Promise<FeedCommentSnapshot | null> {
        const comment = await this.feedCommentRepository.findCommentByIdWithAuthor(commentId);
        return comment ? this.toCommentSnapshot(comment) : null;
    }

    async createComment(data: {
        videoId: string;
        userId: string;
        userModel: 'Breeder' | 'Adopter';
        content: string;
        parentId?: string;
    }): Promise<FeedCommentSnapshot> {
        const comment = await this.feedCommentRepository.createComment(data);

        return this.toCommentSnapshot(comment);
    }

    async incrementVideoCommentCount(videoId: string, delta: number): Promise<void> {
        await this.feedCommentRepository.incrementVideoCommentCount(videoId, delta);
    }

    async readRootComments(videoId: string, skip: number, limit: number): Promise<FeedCommentSnapshot[]> {
        const comments = await this.feedCommentRepository.findRootCommentsByVideo(videoId, skip, limit);

        return comments.map((comment) => this.toCommentSnapshot(comment));
    }

    async countRootComments(videoId: string): Promise<number> {
        return this.feedCommentRepository.countRootCommentsByVideo(videoId);
    }

    async readReplyCounts(parentIds: string[]): Promise<FeedCommentReplyCountSnapshot[]> {
        const replyCounts = await this.feedCommentRepository.aggregateReplyCounts(parentIds);

        return replyCounts.map((replyCount) => ({
            commentId: replyCount._id.toString(),
            count: replyCount.count,
        }));
    }

    async readReplies(commentId: string, skip: number, limit: number): Promise<FeedCommentSnapshot[]> {
        const replies = await this.feedCommentRepository.findRepliesByParent(commentId, skip, limit);

        return replies.map((reply) => this.toCommentSnapshot(reply));
    }

    async countReplies(commentId: string): Promise<number> {
        return this.feedCommentRepository.countRepliesByParent(commentId);
    }

    async updateCommentContent(commentId: string, content: string): Promise<FeedCommentSnapshot | null> {
        const comment = await this.feedCommentRepository.updateCommentContent(commentId, content);

        return comment ? this.toCommentSnapshot(comment) : null;
    }

    async markDeleted(commentId: string): Promise<FeedCommentSnapshot | null> {
        const comment = await this.feedCommentRepository.markDeleted(commentId);

        return comment ? this.toCommentSnapshot(comment) : null;
    }

    private toCommentSnapshot(comment: FeedCommentDocumentRecord): FeedCommentSnapshot {
        const populatedAuthor =
            comment.userId && typeof comment.userId === 'object' && '_id' in comment.userId ? comment.userId : null;

        return {
            id: comment._id.toString(),
            videoId: comment.videoId.toString(),
            userId: populatedAuthor ? populatedAuthor._id.toString() : comment.userId.toString(),
            content: comment.content,
            parentId: comment.parentId ? comment.parentId.toString() : undefined,
            likeCount: comment.likeCount || 0,
            isDeleted: !!comment.isDeleted,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            author: populatedAuthor
                ? {
                      id: populatedAuthor._id.toString(),
                      name: populatedAuthor.name,
                      profileImageFileName: populatedAuthor.profileImageFileName,
                      businessName: populatedAuthor.businessName,
                  }
                : null,
        };
    }
}
