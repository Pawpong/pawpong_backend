import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Video, VideoStatus } from '../../../../schema/video.schema';
import { VideoLike } from '../../../../schema/video-like.schema';
import {
    FeedLikeManagerPort,
    FeedLikeSnapshot,
    FeedLikeVideoCounterSnapshot,
    FeedLikeVideoSnapshot,
} from '../application/ports/feed-like-manager.port';

@Injectable()
export class FeedLikeMongooseManagerAdapter implements FeedLikeManagerPort {
    constructor(
        @InjectModel(Video.name) private readonly videoModel: Model<Video>,
        @InjectModel(VideoLike.name) private readonly videoLikeModel: Model<VideoLike>,
    ) {}

    async findVideoCounter(videoId: string): Promise<FeedLikeVideoCounterSnapshot | null> {
        const objectId = this.toObjectId(videoId);
        if (!objectId) {
            return null;
        }

        const video = await this.videoModel.findById(objectId).lean().exec();
        if (!video) {
            return null;
        }

        return {
            id: video._id.toString(),
            likeCount: video.likeCount || 0,
        };
    }

    async findUserLike(videoId: string, userId: string): Promise<FeedLikeSnapshot | null> {
        const videoObjectId = this.toObjectId(videoId);
        const userObjectId = this.toObjectId(userId);
        if (!videoObjectId || !userObjectId) {
            return null;
        }

        const like = await this.videoLikeModel
            .findOne({
                videoId: videoObjectId,
                userId: userObjectId,
            })
            .lean()
            .exec();

        if (!like) {
            return null;
        }

        return {
            id: like._id.toString(),
            videoId: like.videoId.toString(),
            userId: like.userId.toString(),
        };
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

    async updateVideoLikeCount(videoId: string, delta: number): Promise<number> {
        const video = await this.videoModel
            .findByIdAndUpdate(videoId, { $inc: { likeCount: delta } }, { new: true })
            .lean()
            .exec();

        return video?.likeCount || 0;
    }

    async readMyLikedVideos(userId: string, skip: number, limit: number): Promise<FeedLikeVideoSnapshot[]> {
        const userObjectId = this.toObjectId(userId);
        if (!userObjectId) {
            return [];
        }

        const likes = await this.videoLikeModel
            .find({ userId: userObjectId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        const videoIds = likes.map((like) => like.videoId).filter(Boolean);
        if (videoIds.length === 0) {
            return [];
        }

        const videos = await this.videoModel
            .find({
                _id: { $in: videoIds },
                status: VideoStatus.READY,
            })
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean()
            .exec();

        const videosById = new Map(videos.map((video) => [video._id.toString(), this.toVideoSnapshot(video)]));
        return likes
            .map((like) => videosById.get(like.videoId.toString()))
            .filter((video): video is FeedLikeVideoSnapshot => !!video);
    }

    async countMyLikedVideos(userId: string): Promise<number> {
        const userObjectId = this.toObjectId(userId);
        if (!userObjectId) {
            return 0;
        }

        return this.videoLikeModel.countDocuments({ userId: userObjectId }).exec();
    }

    private toVideoSnapshot(video: any): FeedLikeVideoSnapshot {
        return {
            id: video._id.toString(),
            title: video.title,
            thumbnailKey: video.thumbnailKey,
            duration: video.duration,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            uploadedBy: video.uploadedBy
                ? {
                      id: video.uploadedBy._id.toString(),
                      name: video.uploadedBy.name,
                      profileImageFileName: video.uploadedBy.profileImageFileName,
                      businessName: video.uploadedBy.businessName,
                  }
                : null,
            createdAt: video.createdAt,
        };
    }

    private toObjectId(value: string): Types.ObjectId | null {
        return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
    }
}
