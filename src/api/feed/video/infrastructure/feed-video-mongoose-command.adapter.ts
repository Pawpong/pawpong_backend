import { Injectable } from '@nestjs/common';
import {
    FeedVideoCommandPort,
    FeedVideoCommandSnapshot,
    FeedVideoEncodingResult,
} from '../application/ports/feed-video-command.port';
import { FeedVideoRepository } from '../repository/feed-video.repository';

@Injectable()
export class FeedVideoMongooseCommandAdapter implements FeedVideoCommandPort {
    constructor(private readonly feedVideoRepository: FeedVideoRepository) {}

    async createPendingVideo(data: {
        userId: string;
        uploaderModel: 'Breeder' | 'Adopter';
        title: string;
        description?: string;
        tags: string[];
        originalKey: string;
    }): Promise<{ videoId: string }> {
        return this.feedVideoRepository.createPendingVideo(data);
    }

    async findById(videoId: string): Promise<FeedVideoCommandSnapshot | null> {
        const video = await this.feedVideoRepository.findById(videoId);
        return video ? this.toSnapshot(video) : null;
    }

    async markAsProcessing(videoId: string): Promise<void> {
        await this.feedVideoRepository.markAsProcessing(videoId);
    }

    async readMine(userId: string, skip: number, limit: number): Promise<FeedVideoCommandSnapshot[]> {
        const videos = await this.feedVideoRepository.findMine(userId, skip, limit);

        return videos.map((video) => this.toSnapshot(video));
    }

    countMine(userId: string): Promise<number> {
        return this.feedVideoRepository.countMine(userId);
    }

    async deleteById(videoId: string): Promise<void> {
        await this.feedVideoRepository.deleteById(videoId);
    }

    async updateVisibility(videoId: string, isPublic: boolean): Promise<void> {
        await this.feedVideoRepository.updateVisibility(videoId, isPublic);
    }

    async incrementViewCount(videoId: string): Promise<void> {
        await this.feedVideoRepository.incrementViewCount(videoId);
    }

    async markEncodingComplete(videoId: string, data: FeedVideoEncodingResult): Promise<void> {
        await this.feedVideoRepository.markEncodingComplete(videoId, data);
    }

    async markEncodingFailed(videoId: string, reason: string): Promise<void> {
        await this.feedVideoRepository.markEncodingFailed(videoId, reason);
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
