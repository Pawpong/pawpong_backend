import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Video, VideoDocument } from '../../../../../schema/video.schema';
import { VideoComment } from '../../../../../schema/video-comment.schema';
import type { FeedCommentDocumentRecord, FeedObjectIdLike } from '../../types/feed-document.type';
import { eligibleAppAuthorIds, isIosAppRequest } from '../../../../../common/content-rights/app-request-context';

@Injectable()
export class FeedCommentRepository {
    constructor(
        @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
        @InjectModel(VideoComment.name) private readonly videoCommentModel: Model<VideoComment>,
    ) {}

    async findVideoById(videoId: string) {
        const objectId = this.toObjectId(videoId);
        if (!objectId) {
            return Promise.resolve(null);
        }

        const authorFilter = isIosAppRequest()
            ? { uploadedBy: { $in: await eligibleAppAuthorIds(this.videoModel.db) } }
            : {};
        return this.videoModel.findOne({ _id: objectId, ...authorFilter }).lean().exec();
    }

    async findCommentByIdWithAuthor(commentId: string): Promise<FeedCommentDocumentRecord | null> {
        const objectId = this.toObjectId(commentId);
        if (!objectId) {
            return Promise.resolve(null);
        }

        return this.videoCommentModel
            .findOne({ _id: objectId, ...await this.appCommentFilter() })
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedCommentDocumentRecord | null>;
    }

    createComment(data: {
        videoId: string;
        userId: string;
        userModel: 'Breeder' | 'Adopter';
        content: string;
        parentId?: string;
    }): Promise<FeedCommentDocumentRecord> {
        return this.videoCommentModel.create({
            videoId: new Types.ObjectId(data.videoId),
            userId: new Types.ObjectId(data.userId),
            userModel: data.userModel,
            content: data.content,
            parentId: data.parentId ? new Types.ObjectId(data.parentId) : undefined,
        }) as Promise<FeedCommentDocumentRecord>;
    }

    async incrementVideoCommentCount(videoId: string, delta: number): Promise<void> {
        await this.videoModel.updateOne({ _id: videoId }, { $inc: { commentCount: delta } }).exec();
    }

    async findRootCommentsByVideo(videoId: string, skip: number, limit: number): Promise<FeedCommentDocumentRecord[]> {
        const videoObjectId = this.toObjectId(videoId);
        if (!videoObjectId) {
            return Promise.resolve([] as FeedCommentDocumentRecord[]);
        }

        return this.videoCommentModel
            .find({
                videoId: videoObjectId,
                parentId: { $exists: false },
                isDeleted: false,
                ...await this.appCommentFilter(),
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedCommentDocumentRecord[]>;
    }

    async countRootCommentsByVideo(videoId: string): Promise<number> {
        const videoObjectId = this.toObjectId(videoId);
        if (!videoObjectId) {
            return Promise.resolve(0);
        }

        return this.videoCommentModel
            .countDocuments({
                videoId: videoObjectId,
                parentId: { $exists: false },
                isDeleted: false,
                ...await this.appCommentFilter(),
            })
            .exec();
    }

    async aggregateReplyCounts(parentIds: string[]) {
        const parentObjectIds = parentIds
            .map((parentId) => this.toObjectId(parentId))
            .filter((id): id is Types.ObjectId => !!id);

        if (parentObjectIds.length === 0) {
            return Promise.resolve([]);
        }

        return this.videoCommentModel.aggregate([
            {
                $match: {
                    parentId: { $in: parentObjectIds },
                    isDeleted: false,
                    ...await this.appCommentFilter(),
                },
            },
            {
                $group: {
                    _id: '$parentId',
                    count: { $sum: 1 },
                },
            },
        ]);
    }

    async findRepliesByParent(commentId: string, skip: number, limit: number): Promise<FeedCommentDocumentRecord[]> {
        const commentObjectId = this.toObjectId(commentId);
        if (!commentObjectId) {
            return Promise.resolve([] as FeedCommentDocumentRecord[]);
        }

        return this.videoCommentModel
            .find({
                parentId: commentObjectId,
                isDeleted: false,
                ...await this.appCommentFilter(),
            })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedCommentDocumentRecord[]>;
    }

    async countRepliesByParent(commentId: string): Promise<number> {
        const commentObjectId = this.toObjectId(commentId);
        if (!commentObjectId) {
            return Promise.resolve(0);
        }

        return this.videoCommentModel
            .countDocuments({
                parentId: commentObjectId,
                isDeleted: false,
                ...await this.appCommentFilter(),
            })
            .exec();
    }

    updateCommentContent(commentId: string, content: string): Promise<FeedCommentDocumentRecord | null> {
        const objectId = this.toObjectId(commentId);
        if (!objectId) {
            return Promise.resolve(null);
        }

        return this.videoCommentModel
            .findByIdAndUpdate(objectId, { content }, { new: true })
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedCommentDocumentRecord | null>;
    }

    markDeleted(commentId: string): Promise<FeedCommentDocumentRecord | null> {
        const objectId = this.toObjectId(commentId);
        if (!objectId) {
            return Promise.resolve(null);
        }

        return this.videoCommentModel
            .findByIdAndUpdate(objectId, { isDeleted: true }, { new: true })
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedCommentDocumentRecord | null>;
    }

    private toObjectId(value: string): Types.ObjectId | null {
        return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
    }

    private async appCommentFilter(): Promise<{ userId?: { $in: Types.ObjectId[] } }> {
        if (!isIosAppRequest()) return {};
        return { userId: { $in: await eligibleAppAuthorIds(this.videoCommentModel.db) } };
    }
}
