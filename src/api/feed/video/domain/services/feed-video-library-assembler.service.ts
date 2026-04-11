import { Injectable } from '@nestjs/common';

import { FeedVideoCommandSnapshot } from '../../application/ports/feed-video-command.port';
import type { FeedMyVideoListResult } from '../../application/types/feed-video-result.type';
import { FeedVideoSummaryPresentationService } from '../../../domain/services/feed-video-summary-presentation.service';

type SignedUrlResolver = (fileKey: string) => Promise<string>;

@Injectable()
export class FeedVideoLibraryAssemblerService {
    constructor(private readonly feedVideoSummaryPresentationService: FeedVideoSummaryPresentationService) {}

    async buildMyVideosResult(
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
}
