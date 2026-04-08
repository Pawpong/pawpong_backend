import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { FeedLikeRepository } from '../repository/feed-like.repository';
import {
    FeedLikeManagerPort,
    FeedLikeSnapshot,
    FeedLikeVideoCounterSnapshot,
    FeedLikeVideoSnapshot,
} from '../application/ports/feed-like-manager.port';

@Injectable()
export class FeedLikeMongooseManagerAdapter implements FeedLikeManagerPort {
    constructor(private readonly feedLikeRepository: FeedLikeRepository) {}

    async findVideoCounter(videoId: string): Promise<FeedLikeVideoCounterSnapshot | null> {
        const video = await this.feedLikeRepository.findVideoById(videoId);
        if (!video) {
            return null;
        }

        return {
            id: video._id.toString(),
            likeCount: video.likeCount || 0,
        };
    }

    async findUserLike(videoId: string, userId: string): Promise<FeedLikeSnapshot | null> {
        const like = await this.feedLikeRepository.findLikeByVideoAndUser(videoId, userId);
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
        await this.feedLikeRepository.createLike(data);
    }

    async deleteLike(likeId: string): Promise<void> {
        await this.feedLikeRepository.deleteLike(likeId);
    }

    async updateVideoLikeCount(videoId: string, delta: number): Promise<number> {
        const video = await this.feedLikeRepository.updateVideoLikeCount(videoId, delta);

        return video?.likeCount || 0;
    }

    async readMyLikedVideos(userId: string, skip: number, limit: number): Promise<FeedLikeVideoSnapshot[]> {
        const likes = await this.feedLikeRepository.findLikesByUser(userId, skip, limit);

        const videoIds = likes.map((like) => like.videoId).filter(Boolean);
        if (videoIds.length === 0) {
            return [];
        }

        const videos = await this.feedLikeRepository.findReadyVideosByIds(videoIds as Types.ObjectId[]);

        const videosById = new Map(videos.map((video) => [video._id.toString(), this.toVideoSnapshot(video)]));
        return likes
            .map((like) => videosById.get(like.videoId.toString()))
            .filter((video): video is FeedLikeVideoSnapshot => !!video);
    }

    async countMyLikedVideos(userId: string): Promise<number> {
        return this.feedLikeRepository.countLikesByUser(userId);
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
}
