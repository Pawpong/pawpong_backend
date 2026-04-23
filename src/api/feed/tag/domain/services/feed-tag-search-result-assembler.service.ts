import { Injectable } from '@nestjs/common';

import { FeedTagUploaderSnapshot, FeedTagVideoSnapshot } from '../../application/ports/feed-tag-reader.port';
import type { FeedTagSearchResult, FeedTagUploaderResult } from '../../application/types/feed-tag-result.type';
import { FeedVideoSummaryMapperService } from '../../../domain/services/feed-video-summary-mapper.service';

type ThumbnailUrlResolver = (fileKey?: string) => string | Promise<string | null> | null;

@Injectable()
export class FeedTagSearchResultAssemblerService {
    constructor(private readonly feedVideoSummaryMapperService: FeedVideoSummaryMapperService) {}

    async buildSearchResponse(
        videos: FeedTagVideoSnapshot[],
        tag: string,
        page: number,
        limit: number,
        totalCount: number,
        resolveThumbnailUrl: ThumbnailUrlResolver,
    ): Promise<FeedTagSearchResult> {
        const items = await Promise.all(
            videos.map(async (video) => ({
                videoId: video.id,
                title: video.title,
                thumbnailUrl: (await resolveThumbnailUrl(video.thumbnailKey)) || null,
                duration: video.duration,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                tags: video.tags,
                uploadedBy: this.toUploaderResponse(video.uploadedBy),
                createdAt: video.createdAt,
            })),
        );

        return {
            videos: items,
            tag,
            pagination: this.feedVideoSummaryMapperService.toPagination(page, limit, totalCount),
        };
    }

    private toUploaderResponse(uploader: FeedTagUploaderSnapshot | null): FeedTagUploaderResult | null {
        return this.feedVideoSummaryMapperService.toUploaderResponse(uploader);
    }
}
