import { Injectable } from '@nestjs/common';

import { FeedLikeUploaderSnapshot, FeedLikeVideoSnapshot } from '../../application/ports/feed-like-manager.port';
import type {
    FeedLikeStatusResult,
    FeedLikeToggleResult,
    FeedLikeUploaderResult,
    FeedMyLikedVideosResult,
} from '../../application/types/feed-like-result.type';
import { FeedVideoSummaryPresentationService } from '../../../domain/services/feed-video-summary-presentation.service';

type ThumbnailUrlResolver = (fileKey?: string) => string | Promise<string | null> | null;

@Injectable()
export class FeedLikePresentationService {
    constructor(private readonly feedVideoSummaryPresentationService: FeedVideoSummaryPresentationService) {}

    buildToggleResponse(isLiked: boolean, likeCount: number): FeedLikeToggleResult {
        return { isLiked, likeCount };
    }

    buildStatusResponse(isLiked: boolean, likeCount: number): FeedLikeStatusResult {
        return { isLiked, likeCount };
    }

    async buildMyLikedVideosResponse(
        videos: FeedLikeVideoSnapshot[],
        page: number,
        limit: number,
        totalCount: number,
        resolveThumbnailUrl: ThumbnailUrlResolver,
    ): Promise<FeedMyLikedVideosResult> {
        const items = await Promise.all(
            videos.map(async (video) => ({
                videoId: video.id,
                title: video.title,
                thumbnailUrl: (await resolveThumbnailUrl(video.thumbnailKey)) || null,
                duration: video.duration,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                uploadedBy: this.toUploaderResponse(video.uploadedBy),
                createdAt: video.createdAt,
            })),
        );

        return {
            videos: items,
            pagination: this.feedVideoSummaryPresentationService.toPagination(page, limit, totalCount),
        };
    }

    private toUploaderResponse(uploader: FeedLikeUploaderSnapshot | null): FeedLikeUploaderResult | null {
        return this.feedVideoSummaryPresentationService.toUploaderResponse(uploader);
    }
}
