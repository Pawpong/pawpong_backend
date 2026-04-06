import { Injectable } from '@nestjs/common';

import { FeedResponseDto } from '../../dto/response/video-response.dto';
import { FeedVideoCommandSnapshot } from '../../application/ports/feed-video-command.port';
import { FeedVideoSnapshot, FeedVideoUploaderSnapshot } from '../../application/ports/feed-video-reader.port';

type SignedUrlResolver = (fileKey: string) => Promise<string>;

@Injectable()
export class FeedVideoPresentationService {
    async buildFeedResponse(
        videos: FeedVideoSnapshot[],
        page: number,
        limit: number,
        totalCount: number,
        resolveSignedUrl: SignedUrlResolver,
    ): Promise<FeedResponseDto> {
        const items = await Promise.all(
            videos.map(async (video) => ({
                videoId: video.id,
                title: video.title,
                thumbnailUrl: await resolveSignedUrl(video.thumbnailKey || ''),
                duration: video.duration,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                uploadedBy: this.toUploaderResponse(video.uploadedBy),
                createdAt: video.createdAt,
            })),
        );

        return {
            items,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1,
            },
        };
    }

    async buildPopularResponse(videos: FeedVideoSnapshot[], resolveSignedUrl: SignedUrlResolver): Promise<any[]> {
        return Promise.all(
            videos.map(async (video) => ({
                videoId: video.id,
                title: video.title,
                thumbnailUrl: await resolveSignedUrl(video.thumbnailKey || ''),
                duration: video.duration,
                viewCount: video.viewCount,
                uploadedBy: this.toUploaderResponse(video.uploadedBy),
            })),
        );
    }

    async buildMyVideosResponse(
        videos: FeedVideoCommandSnapshot[],
        page: number,
        limit: number,
        totalCount: number,
        resolveSignedUrl: SignedUrlResolver,
    ): Promise<any> {
        const items = await Promise.all(
            videos.map(async (video) => ({
                videoId: video.id,
                title: video.title,
                status: video.status,
                thumbnailUrl: video.thumbnailKey ? await resolveSignedUrl(video.thumbnailKey) : null,
                duration: video.duration,
                viewCount: video.viewCount,
                isPublic: video.isPublic,
                createdAt: video.createdAt,
                failureReason: video.failureReason,
            })),
        );

        return {
            items,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1,
            },
        };
    }

    buildPendingMetaResponse(video: FeedVideoSnapshot): any {
        return {
            videoId: video.id,
            status: video.status,
            title: video.title,
            failureReason: video.failureReason,
        };
    }

    async buildMetaResponse(video: FeedVideoSnapshot, resolveSignedUrl: SignedUrlResolver): Promise<any> {
        return {
            videoId: video.id,
            title: video.title,
            description: video.description,
            status: video.status,
            playUrl: await resolveSignedUrl(video.hlsManifestKey || ''),
            thumbnailUrl: await resolveSignedUrl(video.thumbnailKey || ''),
            duration: video.duration,
            width: video.width,
            height: video.height,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            commentCount: video.commentCount,
            tags: video.tags,
            uploadedBy: this.toUploaderResponse(video.uploadedBy),
            createdAt: video.createdAt,
        };
    }

    private toUploaderResponse(uploader: FeedVideoUploaderSnapshot | null): any {
        if (!uploader) {
            return null;
        }

        return {
            _id: uploader.id,
            name: uploader.name,
            profileImageFileName: uploader.profileImageFileName,
            businessName: uploader.businessName,
        };
    }
}
