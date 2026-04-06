import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Video } from '../../../../schema/video.schema';
import { VideoComment } from '../../../../schema/video-comment.schema';
import {
    FeedCommentManagerPort,
    FeedCommentReplyCountSnapshot,
    FeedCommentSnapshot,
} from '../application/ports/feed-comment-manager.port';

@Injectable()
export class FeedCommentMongooseManagerAdapter implements FeedCommentManagerPort {
    constructor(
        @InjectModel(Video.name) private readonly videoModel: Model<Video>,
        @InjectModel(VideoComment.name) private readonly videoCommentModel: Model<VideoComment>,
    ) {}

    async findVideo(videoId: string): Promise<{ id: string } | null> {
        const objectId = this.toObjectId(videoId);
        if (!objectId) {
            return null;
        }

        const video = await this.videoModel.findById(objectId).lean().exec();
        return video ? { id: video._id.toString() } : null;
    }

    async findComment(commentId: string): Promise<FeedCommentSnapshot | null> {
        const objectId = this.toObjectId(commentId);
        if (!objectId) {
            return null;
        }

        const comment = await this.videoCommentModel
            .findById(objectId)
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec();

        return comment ? this.toCommentSnapshot(comment) : null;
    }

    async createComment(data: {
        videoId: string;
        userId: string;
        userModel: 'Breeder' | 'Adopter';
        content: string;
        parentId?: string;
    }): Promise<FeedCommentSnapshot> {
        const comment = await this.videoCommentModel.create({
            videoId: new Types.ObjectId(data.videoId),
            userId: new Types.ObjectId(data.userId),
            userModel: data.userModel,
            content: data.content,
            parentId: data.parentId ? new Types.ObjectId(data.parentId) : undefined,
        });

        return this.toCommentSnapshot(comment);
    }

    async incrementVideoCommentCount(videoId: string, delta: number): Promise<void> {
        await this.videoModel.updateOne({ _id: videoId }, { $inc: { commentCount: delta } }).exec();
    }

    async readRootComments(videoId: string, skip: number, limit: number): Promise<FeedCommentSnapshot[]> {
        const videoObjectId = this.toObjectId(videoId);
        if (!videoObjectId) {
            return [];
        }

        const comments = await this.videoCommentModel
            .find({
                videoId: videoObjectId,
                parentId: { $exists: false },
                isDeleted: false,
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec();

        return comments.map((comment) => this.toCommentSnapshot(comment));
    }

    async countRootComments(videoId: string): Promise<number> {
        const videoObjectId = this.toObjectId(videoId);
        if (!videoObjectId) {
            return 0;
        }

        return this.videoCommentModel
            .countDocuments({
                videoId: videoObjectId,
                parentId: { $exists: false },
                isDeleted: false,
            })
            .exec();
    }

    async readReplyCounts(parentIds: string[]): Promise<FeedCommentReplyCountSnapshot[]> {
        const parentObjectIds = parentIds.map((parentId) => this.toObjectId(parentId)).filter((id): id is Types.ObjectId => !!id);
        if (parentObjectIds.length === 0) {
            return [];
        }

        const replyCounts = await this.videoCommentModel.aggregate([
            {
                $match: {
                    parentId: { $in: parentObjectIds },
                    isDeleted: false,
                },
            },
            {
                $group: {
                    _id: '$parentId',
                    count: { $sum: 1 },
                },
            },
        ]);

        return replyCounts.map((replyCount) => ({
            commentId: replyCount._id.toString(),
            count: replyCount.count,
        }));
    }

    async readReplies(commentId: string, skip: number, limit: number): Promise<FeedCommentSnapshot[]> {
        const commentObjectId = this.toObjectId(commentId);
        if (!commentObjectId) {
            return [];
        }

        const replies = await this.videoCommentModel
            .find({
                parentId: commentObjectId,
                isDeleted: false,
            })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec();

        return replies.map((reply) => this.toCommentSnapshot(reply));
    }

    async countReplies(commentId: string): Promise<number> {
        const commentObjectId = this.toObjectId(commentId);
        if (!commentObjectId) {
            return 0;
        }

        return this.videoCommentModel
            .countDocuments({
                parentId: commentObjectId,
                isDeleted: false,
            })
            .exec();
    }

    async updateCommentContent(commentId: string, content: string): Promise<FeedCommentSnapshot | null> {
        const objectId = this.toObjectId(commentId);
        if (!objectId) {
            return null;
        }

        const comment = await this.videoCommentModel
            .findByIdAndUpdate(objectId, { content }, { new: true })
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec();

        return comment ? this.toCommentSnapshot(comment) : null;
    }

    async markDeleted(commentId: string): Promise<FeedCommentSnapshot | null> {
        const objectId = this.toObjectId(commentId);
        if (!objectId) {
            return null;
        }

        const comment = await this.videoCommentModel
            .findByIdAndUpdate(objectId, { isDeleted: true }, { new: true })
            .populate('userId', 'name profileImageFileName businessName')
            .lean()
            .exec();

        return comment ? this.toCommentSnapshot(comment) : null;
    }

    private toCommentSnapshot(comment: any): FeedCommentSnapshot {
        const populatedAuthor = comment.userId && typeof comment.userId === 'object' && '_id' in comment.userId ? comment.userId : null;

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

    private toObjectId(value: string): Types.ObjectId | null {
        return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
    }
}
