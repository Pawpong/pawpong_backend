import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Video, VideoStatus } from '../../../../schema/video.schema';
import { FeedVideoCommandPort, FeedVideoCommandSnapshot } from '../application/ports/feed-video-command.port';

@Injectable()
export class FeedVideoMongooseCommandAdapter implements FeedVideoCommandPort {
    constructor(@InjectModel(Video.name) private readonly videoModel: Model<Video>) {}

    async createPendingVideo(data: {
        userId: string;
        uploaderModel: 'Breeder' | 'Adopter';
        title: string;
        description?: string;
        tags: string[];
        originalKey: string;
    }): Promise<{ videoId: string }> {
        const video = await this.videoModel.create({
            uploadedBy: new Types.ObjectId(data.userId),
            uploaderModel: data.uploaderModel,
            title: data.title,
            description: data.description,
            tags: data.tags,
            status: VideoStatus.PENDING,
            originalKey: data.originalKey,
        });

        return { videoId: video.id as string };
    }

    async findById(videoId: string): Promise<FeedVideoCommandSnapshot | null> {
        const video = await this.videoModel.findById(videoId).lean().exec();
        return video ? this.toSnapshot(video) : null;
    }

    async markAsProcessing(videoId: string): Promise<void> {
        await this.videoModel.updateOne({ _id: videoId }, { status: VideoStatus.PROCESSING }).exec();
    }

    async readMine(userId: string, skip: number, limit: number): Promise<FeedVideoCommandSnapshot[]> {
        const videos = await this.videoModel
            .find({ uploadedBy: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        return videos.map((video) => this.toSnapshot(video));
    }

    countMine(userId: string): Promise<number> {
        return this.videoModel.countDocuments({
            uploadedBy: new Types.ObjectId(userId),
        });
    }

    async deleteById(videoId: string): Promise<void> {
        await this.videoModel.deleteOne({ _id: videoId }).exec();
    }

    async updateVisibility(videoId: string, isPublic: boolean): Promise<void> {
        await this.videoModel.updateOne({ _id: videoId }, { isPublic }).exec();
    }

    private toSnapshot(video: any): FeedVideoCommandSnapshot {
        return {
            id: video._id.toString(),
            uploadedById: video.uploadedBy.toString(),
            title: video.title,
            status: video.status,
            originalKey: video.originalKey,
            thumbnailKey: video.thumbnailKey,
            duration: video.duration,
            viewCount: video.viewCount,
            isPublic: video.isPublic,
            createdAt: video.createdAt,
            failureReason: video.failureReason,
        };
    }
}
