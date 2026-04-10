import { Injectable } from '@nestjs/common';

import { FeedVideoCommandSnapshot } from '../../application/ports/feed-video-command.port';
import { FeedVideoSnapshot, FeedVideoUploaderSnapshot } from '../../application/ports/feed-video-reader.port';
import type {
    FeedMyVideoListResult,
    FeedPendingVideoMetaResult,
    FeedPopularVideoItemResult,
    FeedVideoFeedResult,
    FeedVideoMetaResult,
    FeedVideoUploaderResult,
} from '../../application/types/feed-video-result.type';
import { FeedVideoSummaryPresentationService } from '../../../domain/services/feed-video-summary-presentation.service';

type SignedUrlResolver = (fileKey: string) => Promise<string>;

@Injectable()
export class FeedVideoPresentationService {
    constructor(private readonly feedVideoSummaryPresentationService: FeedVideoSummaryPresentationService) {}

    async buildFeedResponse(
        videos: FeedVideoSnapshot[],
        page: number,
        limit: number,
        totalCount: number,
        resolveSignedUrl: SignedUrlResolver,
    ): Promise<FeedVideoFeedResult> {
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
            pagination: this.feedVideoSummaryPresentationService.toPagination(page, limit, totalCount),
        };
    }

    async buildPopularResponse(
        videos: FeedVideoSnapshot[],
        resolveSignedUrl: SignedUrlResolver,
    ): Promise<FeedPopularVideoItemResult[]> {
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
    ): Promise<FeedMyVideoListResult> {
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
            pagination: this.feedVideoSummaryPresentationService.toPagination(page, limit, totalCount),
        };
    }

    buildPendingMetaResponse(video: FeedVideoSnapshot): FeedPendingVideoMetaResult {
        return {
            videoId: video.id,
            status: video.status,
            title: video.title,
            failureReason: video.failureReason,
        };
    }

    async buildMetaResponse(video: FeedVideoSnapshot, resolveSignedUrl: SignedUrlResolver): Promise<FeedVideoMetaResult> {
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

    private toUploaderResponse(uploader: FeedVideoUploaderSnapshot | null): FeedVideoUploaderResult | null {
        return this.feedVideoSummaryPresentationService.toUploaderResponse(uploader);
    }
}
