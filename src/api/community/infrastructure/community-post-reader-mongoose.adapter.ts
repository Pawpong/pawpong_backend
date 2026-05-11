import { Injectable } from '@nestjs/common';

import type { CommunityPostCommentDocument } from '../../../schema/community-post-comment.schema';
import type { CommunityPostDocument } from '../../../schema/community-post.schema';
import type {
    CommunityPostCommentListResult,
    CommunityPostListResult,
    CommunityPostReaderPort,
} from '../application/ports/community-post-reader.port';
import type {
    CommunityPostCommentListQuery,
    CommunityPostCommentSnapshot,
    CommunityPostListQuery,
    CommunityPostSnapshot,
} from '../application/types/community-post.type';
import { CommunityRepository } from '../repository/community.repository';

@Injectable()
export class CommunityPostReaderMongooseAdapter implements CommunityPostReaderPort {
    constructor(private readonly repository: CommunityRepository) {}

    async listPosts(query: CommunityPostListQuery): Promise<CommunityPostListResult> {
        const { docs, totalItems } = await this.repository.listPosts(query);
        return { snapshots: docs.map((doc) => this.toPostSnapshot(doc)), totalItems };
    }

    async readPostById(postId: string): Promise<CommunityPostSnapshot | null> {
        const doc = await this.repository.findPostById(postId);
        return doc ? this.toPostSnapshot(doc) : null;
    }

    async listComments(query: CommunityPostCommentListQuery): Promise<CommunityPostCommentListResult> {
        const { docs, totalItems } = await this.repository.listComments(query);
        return { snapshots: docs.map((doc) => this.toCommentSnapshot(doc)), totalItems };
    }

    private toPostSnapshot(doc: CommunityPostDocument): CommunityPostSnapshot {
        return {
            postId: String(doc._id),
            authorId: String(doc.authorId),
            authorModel: doc.authorModel as 'Adopter' | 'Breeder',
            authorNickname: doc.authorNickname,
            authorProfileImageFileName: doc.authorProfileImageFileName ?? undefined,
            title: doc.title ?? undefined,
            body: doc.body,
            photos: doc.photos ?? [],
            petType: doc.petType,
            category: doc.category ?? undefined,
            likeCount: doc.likeCount ?? 0,
            commentCount: doc.commentCount ?? 0,
            saveCount: doc.saveCount ?? 0,
            viewCount: doc.viewCount ?? 0,
            createdAt: doc.createdAt,
        };
    }

    private toCommentSnapshot(doc: CommunityPostCommentDocument): CommunityPostCommentSnapshot {
        return {
            commentId: String(doc._id),
            postId: String(doc.postId),
            authorId: String(doc.authorId),
            authorModel: doc.authorModel as 'Adopter' | 'Breeder',
            authorNickname: doc.authorNickname,
            authorProfileImageFileName: doc.authorProfileImageFileName ?? undefined,
            parentCommentId: doc.parentCommentId ? String(doc.parentCommentId) : null,
            body: doc.body,
            likeCount: doc.likeCount ?? 0,
            createdAt: doc.createdAt,
        };
    }
}
