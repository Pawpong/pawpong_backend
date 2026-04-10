import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Video, VideoDocument, VideoStatus } from '../../../../schema/video.schema';
import { VideoLike } from '../../../../schema/video-like.schema';
import type { FeedObjectIdLike, FeedVideoDocumentRecord } from '../../types/feed-document.type';

@Injectable()
export class FeedLikeRepository {
    constructor(
        @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
        @InjectModel(VideoLike.name) private readonly videoLikeModel: Model<VideoLike>,
    ) {}

    findVideoById(videoId: string) {
        const objectId = this.toObjectId(videoId);
        if (!objectId) {
            return Promise.resolve(null);
        }

        return this.videoModel.findById(objectId).lean().exec();
    }

    findLikeByVideoAndUser(videoId: string, userId: string) {
        const videoObjectId = this.toObjectId(videoId);
        const userObjectId = this.toObjectId(userId);
        if (!videoObjectId || !userObjectId) {
            return Promise.resolve(null);
        }

        return this.videoLikeModel
            .findOne({
                videoId: videoObjectId,
                userId: userObjectId,
            })
            .lean()
            .exec();
    }

    async createLike(data: { videoId: string; userId: string; userModel: 'Breeder' | 'Adopter' }): Promise<void> {
        await this.videoLikeModel.create({
            videoId: new Types.ObjectId(data.videoId),
            userId: new Types.ObjectId(data.userId),
            userModel: data.userModel,
        });
    }

    async deleteLike(likeId: string): Promise<void> {
        await this.videoLikeModel.deleteOne({ _id: likeId }).exec();
    }

    updateVideoLikeCount(videoId: string, delta: number) {
        return this.videoModel
            .findByIdAndUpdate(videoId, { $inc: { likeCount: delta } }, { new: true })
            .lean()
            .exec();
    }

    findLikesByUser(userId: string, skip: number, limit: number) {
        const userObjectId = this.toObjectId(userId);
        if (!userObjectId) {
            return Promise.resolve([]);
        }

        return this.videoLikeModel
            .find({ userId: userObjectId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }

    countLikesByUser(userId: string): Promise<number> {
        const userObjectId = this.toObjectId(userId);
        if (!userObjectId) {
            return Promise.resolve(0);
        }

        return this.videoLikeModel.countDocuments({ userId: userObjectId }).exec();
    }

    findReadyVideosByIds(videoIds: Types.ObjectId[]): Promise<FeedVideoDocumentRecord[]> {
        return this.videoModel
            .find({
                _id: { $in: videoIds },
                status: VideoStatus.READY,
            })
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean()
            .exec() as Promise<FeedVideoDocumentRecord[]>;
    }

    private toObjectId(value: string): Types.ObjectId | null {
        return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
    }
}
