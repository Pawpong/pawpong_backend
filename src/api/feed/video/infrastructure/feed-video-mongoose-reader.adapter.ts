import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Video, VideoStatus } from '../../../../schema/video.schema';
import { FeedVideoReaderPort, FeedVideoSnapshot } from '../application/ports/feed-video-reader.port';

@Injectable()
export class FeedVideoMongooseReaderAdapter implements FeedVideoReaderPort {
    constructor(@InjectModel(Video.name) private readonly videoModel: Model<Video>) {}

    async readPublicFeed(skip: number, limit: number): Promise<FeedVideoSnapshot[]> {
        const videos = await this.videoModel
            .find({ status: VideoStatus.READY, isPublic: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean();

        return videos.map((video) => this.toSnapshot(video));
    }

    countPublicFeed(): Promise<number> {
        return this.videoModel.countDocuments({ status: VideoStatus.READY, isPublic: true });
    }

    async readPopular(limit: number): Promise<FeedVideoSnapshot[]> {
        const videos = await this.videoModel
            .find({ status: VideoStatus.READY, isPublic: true })
            .sort({ viewCount: -1 })
            .limit(limit)
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean();

        return videos.map((video) => this.toSnapshot(video));
    }

    async readById(videoId: string): Promise<FeedVideoSnapshot | null> {
        const video = await this.videoModel
            .findById(videoId)
            .populate('uploadedBy', 'name profileImageFileName businessName')
            .lean();

        return video ? this.toSnapshot(video) : null;
    }

    private toSnapshot(video: any): FeedVideoSnapshot {
        return {
            id: video._id.toString(),
            title: video.title,
            description: video.description,
            status: video.status,
            hlsManifestKey: video.hlsManifestKey,
            thumbnailKey: video.thumbnailKey,
            duration: video.duration,
            width: video.width,
            height: video.height,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            commentCount: video.commentCount,
            tags: video.tags || [],
            uploadedBy: video.uploadedBy
                ? {
                      id: video.uploadedBy._id.toString(),
                      name: video.uploadedBy.name,
                      profileImageFileName: video.uploadedBy.profileImageFileName,
                      businessName: video.uploadedBy.businessName,
                  }
                : null,
            createdAt: video.createdAt,
            failureReason: video.failureReason,
        };
    }
}
