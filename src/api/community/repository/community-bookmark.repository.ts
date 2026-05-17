import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    CommunityBookmark,
    CommunityBookmarkDocument,
} from '../../../schema/community-bookmark.schema';
import { CommunityPost, CommunityPostDocument } from '../../../schema/community-post.schema';

@Injectable()
export class CommunityBookmarkRepository {
    constructor(
        @InjectModel(CommunityBookmark.name)
        private readonly bookmarkModel: Model<CommunityBookmarkDocument>,
        @InjectModel(CommunityPost.name)
        private readonly postModel: Model<CommunityPostDocument>,
    ) {}

    async save(
        postId: string,
        userId: string,
        userModel: 'Adopter' | 'Breeder',
    ): Promise<{ alreadySaved: boolean }> {
        if (!Types.ObjectId.isValid(postId)) {
            return { alreadySaved: false };
        }
        const postObjectId = new Types.ObjectId(postId);

        try {
            await this.bookmarkModel.create({ postId: postObjectId, userId, userModel });
            await this.postModel.updateOne({ _id: postObjectId }, { $inc: { saveCount: 1 } }).exec();
            return { alreadySaved: false };
        } catch (err: unknown) {
            // duplicate key error (code 11000) → 이미 저장됨
            if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
                return { alreadySaved: true };
            }
            throw err;
        }
    }

    async unsave(postId: string, userId: string): Promise<{ wasSaved: boolean }> {
        if (!Types.ObjectId.isValid(postId)) {
            return { wasSaved: false };
        }
        const postObjectId = new Types.ObjectId(postId);
        const result = await this.bookmarkModel.deleteOne({ postId: postObjectId, userId }).exec();

        if (result.deletedCount === 0) {
            return { wasSaved: false };
        }

        // saveCount 0 미만 방지
        await this.postModel
            .updateOne({ _id: postObjectId, saveCount: { $gt: 0 } }, { $inc: { saveCount: -1 } })
            .exec();

        return { wasSaved: true };
    }

    async listSavedPostIds(
        userId: string,
        skip: number,
        limit: number,
    ): Promise<{ postIds: string[]; totalItems: number }> {
        const [docs, totalItems] = await Promise.all([
            this.bookmarkModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean<{ postId: Types.ObjectId }[]>()
                .exec(),
            this.bookmarkModel.countDocuments({ userId }).exec(),
        ]);

        return {
            postIds: docs.map((d) => String(d.postId)),
            totalItems,
        };
    }

    async findSavedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
        const validIds = postIds.filter((id) => Types.ObjectId.isValid(id));
        if (validIds.length === 0) return new Set();

        const docs = await this.bookmarkModel
            .find({ userId, postId: { $in: validIds.map((id) => new Types.ObjectId(id)) } })
            .select('postId')
            .lean<{ postId: Types.ObjectId }[]>()
            .exec();

        return new Set(docs.map((d) => String(d.postId)));
    }
}
