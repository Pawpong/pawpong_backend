import { Injectable } from '@nestjs/common';

import { FeedTagUploaderSnapshot, FeedTagVideoSnapshot } from '../../application/ports/feed-tag-reader.port';
import { FeedVideoSummaryPresentationService } from '../../../domain/services/feed-video-summary-presentation.service';

type ThumbnailUrlResolver = (fileKey?: string) => string | Promise<string | null> | null;

@Injectable()
export class FeedTagPresentationService {
    constructor(private readonly feedVideoSummaryPresentationService: FeedVideoSummaryPresentationService) {}

    async buildSearchResponse(
        videos: FeedTagVideoSnapshot[],
        tag: string,
        page: number,
        limit: number,
        totalCount: number,
        resolveThumbnailUrl: ThumbnailUrlResolver,
    ) {
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
            pagination: this.feedVideoSummaryPresentationService.toPagination(page, limit, totalCount),
        };
    }

    private toUploaderResponse(uploader: FeedTagUploaderSnapshot | null): any {
        return this.feedVideoSummaryPresentationService.toUploaderResponse(uploader);
    }
}
