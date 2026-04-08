import { Injectable } from '@nestjs/common';

import { FeedVideoReaderPort, FeedVideoSnapshot } from '../application/ports/feed-video-reader.port';
import { FeedVideoRepository } from '../repository/feed-video.repository';

@Injectable()
export class FeedVideoMongooseReaderAdapter implements FeedVideoReaderPort {
    constructor(private readonly feedVideoRepository: FeedVideoRepository) {}

    async readPublicFeed(skip: number, limit: number): Promise<FeedVideoSnapshot[]> {
        const videos = await this.feedVideoRepository.findPublicFeed(skip, limit);

        return videos.map((video) => this.toSnapshot(video));
    }

    countPublicFeed(): Promise<number> {
        return this.feedVideoRepository.countPublicFeed();
    }

    async readPopular(limit: number): Promise<FeedVideoSnapshot[]> {
        const videos = await this.feedVideoRepository.findPopular(limit);

        return videos.map((video) => this.toSnapshot(video));
    }

    async readById(videoId: string): Promise<FeedVideoSnapshot | null> {
        const video = await this.feedVideoRepository.findByIdWithUploader(videoId);

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
