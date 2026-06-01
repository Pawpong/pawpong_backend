import { Injectable } from '@nestjs/common';

import type { CommunityCommentReaderPort, CommunityCommentSnapshot } from '../application/ports/community-comment-reader.port';
import type { CommunityCommentCreateData, CommunityCommentWriterPort } from '../application/ports/community-comment-writer.port';
import { CommunityRepository } from '../repository/community.repository';

@Injectable()
export class CommunityCommentMongooseAdapter
    implements CommunityCommentWriterPort, CommunityCommentReaderPort
{
    constructor(private readonly repository: CommunityRepository) {}

    async createComment(data: CommunityCommentCreateData): Promise<{ commentId: string }> {
        const { _id } = await this.repository.createComment(data);
        return { commentId: _id };
    }

    updateCommentByAuthor(commentId: string, authorId: string, body: string): Promise<{ changed: boolean }> {
        return this.repository.updateCommentByAuthor(commentId, authorId, body);
    }

    softDeleteCommentByAuthor(commentId: string, authorId: string): Promise<{ changed: boolean }> {
        return this.repository.softDeleteCommentByAuthor(commentId, authorId);
    }

    async readCommentById(commentId: string): Promise<CommunityCommentSnapshot | null> {
        const doc = await this.repository.findCommentById(commentId);
        if (!doc) return null;
        return {
            commentId: String(doc._id),
            postId: String(doc.postId),
            authorId: String(doc.authorId),
            isActive: doc.isActive,
        };
    }
}
