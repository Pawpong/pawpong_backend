import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import {
    CommunityPost,
    CommunityPostDocument,
} from '../../../schema/community-post.schema';
import {
    CommunityPostComment,
    CommunityPostCommentDocument,
} from '../../../schema/community-post-comment.schema';
import type {
    CommunityPostCommentListQuery,
    CommunityPostListQuery,
} from '../application/types/community-post.type';

/**
 * v2 커뮤니티 — Mongoose 직접 접근 캡슐화.
 * adapter 는 본 repository 만 사용한다.
 */
@Injectable()
export class CommunityRepository {
    constructor(
        @InjectModel(CommunityPost.name)
        private readonly postModel: Model<CommunityPostDocument>,
        @InjectModel(CommunityPostComment.name)
        private readonly commentModel: Model<CommunityPostCommentDocument>,
    ) {}

    async listPosts(
        query: CommunityPostListQuery,
    ): Promise<{ docs: CommunityPostDocument[]; totalItems: number }> {
        const filter: FilterQuery<CommunityPost> = { isActive: true };
        if (query.petType) filter.petType = query.petType;
        if (query.category && query.category.trim().length > 0) filter.category = query.category.trim();

        const sort: Record<string, 1 | -1> =
            query.sort === 'popular' ? { likeCount: -1, createdAt: -1 } : { createdAt: -1 };

        const [docs, totalItems] = await Promise.all([
            this.postModel
                .find(filter)
                .sort(sort)
                .skip(query.skip)
                .limit(query.limit)
                .lean<CommunityPostDocument[]>()
                .exec(),
            this.postModel.countDocuments(filter).exec(),
        ]);

        return { docs, totalItems };
    }

    async findPostById(postId: string): Promise<CommunityPostDocument | null> {
        if (!Types.ObjectId.isValid(postId)) return null;
        return this.postModel
            .findOne({ _id: new Types.ObjectId(postId), isActive: true })
            .lean<CommunityPostDocument>()
            .exec();
    }

    /**
     * 게시글 존재 + isActive 만 확인 (전체 도큐먼트 가져오지 않음).
     * 댓글 페이지네이션처럼 후속 페이지에서 가볍게 확인용.
     */
    async existsActivePost(postId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(postId)) return false;
        const found = await this.postModel.exists({ _id: new Types.ObjectId(postId), isActive: true });
        return Boolean(found);
    }

    async listComments(
        query: CommunityPostCommentListQuery,
    ): Promise<{ docs: CommunityPostCommentDocument[]; totalItems: number }> {
        if (!Types.ObjectId.isValid(query.postId)) {
            return { docs: [], totalItems: 0 };
        }
        const filter: FilterQuery<CommunityPostComment> = {
            postId: new Types.ObjectId(query.postId),
            isActive: true,
        };

        const [docs, totalItems] = await Promise.all([
            this.commentModel
                .find(filter)
                .sort({ createdAt: 1 })
                .skip(query.skip)
                .limit(query.limit)
                .lean<CommunityPostCommentDocument[]>()
                .exec(),
            this.commentModel.countDocuments(filter).exec(),
        ]);

        return { docs, totalItems };
    }
}
