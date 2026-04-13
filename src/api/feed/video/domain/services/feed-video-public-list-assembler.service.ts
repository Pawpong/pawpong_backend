import { Injectable } from '@nestjs/common';

import { FeedVideoSnapshot } from '../../application/ports/feed-video-reader.port';
import type { FeedPopularVideoItemResult, FeedVideoFeedResult } from '../../application/types/feed-video-result.type';
import { FeedVideoSummaryMapperService } from '../../../domain/services/feed-video-summary-mapper.service';

type SignedUrlResolver = (fileKey: string) => Promise<string>;

@Injectable()
export class FeedVideoPublicListAssemblerService {
    constructor(private readonly feedVideoSummaryMapperService: FeedVideoSummaryMapperService) {}

    async buildFeedResult(
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
                uploadedBy: this.feedVideoSummaryMapperService.toUploaderResponse(video.uploadedBy),
                createdAt: video.createdAt,
            })),
        );

        return {
            items,
            pagination: this.feedVideoSummaryMapperService.toPagination(page, limit, totalCount),
        };
    }

    async buildPopularResult(
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
                uploadedBy: this.feedVideoSummaryMapperService.toUploaderResponse(video.uploadedBy),
            })),
        );
    }
}
