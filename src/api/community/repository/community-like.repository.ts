import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CommunityPostLike, CommunityPostLikeDocument } from '../../../schema/community-post-like.schema';
import type { CommunityAuthorModel } from '../application/types/community-post.type';

@Injectable()
export class CommunityLikeRepository {
    constructor(
        @InjectModel(CommunityPostLike.name)
        private readonly likeModel: Model<CommunityPostLikeDocument>,
    ) {}

    async like(postId: string, userId: string, userModel: CommunityAuthorModel): Promise<{ alreadyLiked: boolean }> {
        if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) {
            return { alreadyLiked: false };
        }

        const postObjectId = new Types.ObjectId(postId);
        const userObjectId = new Types.ObjectId(userId);

        const existing = await this.likeModel.exists({ postId: postObjectId, userId: userObjectId });
        if (existing) return { alreadyLiked: true };

        await this.likeModel.create({ postId: postObjectId, userId: userObjectId, userModel });
        // likeCount 증가는 CommunityRepository에 위임
        await this.incrementPostLikeCount(postId, 1);
        return { alreadyLiked: false };
    }

    async unlike(postId: string, userId: string): Promise<{ wasLiked: boolean }> {
        if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) {
            return { wasLiked: false };
        }

        const result = await this.likeModel.deleteOne({
            postId: new Types.ObjectId(postId),
            userId: new Types.ObjectId(userId),
        });

        if (result.deletedCount === 0) return { wasLiked: false };

        await this.incrementPostLikeCount(postId, -1);
        return { wasLiked: true };
    }

    async isLiked(userId: string, postId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) return false;
        const found = await this.likeModel.exists({
            postId: new Types.ObjectId(postId),
            userId: new Types.ObjectId(userId),
        });
        return Boolean(found);
    }

    async findLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
        const validIds = postIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));

        if (validIds.length === 0 || !Types.ObjectId.isValid(userId)) return new Set();

        const docs = await this.likeModel
            .find({ userId: new Types.ObjectId(userId), postId: { $in: validIds } })
            .select('postId')
            .lean<{ postId: Types.ObjectId }[]>()
            .exec();

        return new Set(docs.map((d) => String(d.postId)));
    }

    private async incrementPostLikeCount(postId: string, delta: 1 | -1): Promise<void> {
        // community_posts 컬렉션에 직접 접근 — 순환 의존 없이 같은 DB 내 업데이트
        const db = this.likeModel.db;
        if (delta === 1) {
            await db
                .collection('community_posts')
                .updateOne({ _id: new Types.ObjectId(postId) }, { $inc: { likeCount: 1 } });
        } else {
            await db
                .collection('community_posts')
                .updateOne({ _id: new Types.ObjectId(postId), likeCount: { $gt: 0 } }, { $inc: { likeCount: -1 } });
        }
    }
}
