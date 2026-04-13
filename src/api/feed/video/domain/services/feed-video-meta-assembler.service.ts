import { Injectable } from '@nestjs/common';

import { FeedVideoSnapshot } from '../../application/ports/feed-video-reader.port';
import type { FeedPendingVideoMetaResult, FeedVideoMetaResult } from '../../application/types/feed-video-result.type';
import { FeedVideoSummaryMapperService } from '../../../domain/services/feed-video-summary-mapper.service';

type SignedUrlResolver = (fileKey: string) => Promise<string>;

@Injectable()
export class FeedVideoMetaAssemblerService {
    constructor(private readonly feedVideoSummaryMapperService: FeedVideoSummaryMapperService) {}

    buildPendingMetaResult(video: FeedVideoSnapshot): FeedPendingVideoMetaResult {
        return {
            videoId: video.id,
            status: video.status,
            title: video.title,
            failureReason: video.failureReason,
        };
    }

    async buildMetaResult(video: FeedVideoSnapshot, resolveSignedUrl: SignedUrlResolver): Promise<FeedVideoMetaResult> {
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
            uploadedBy: this.feedVideoSummaryMapperService.toUploaderResponse(video.uploadedBy),
            createdAt: video.createdAt,
        };
    }
}
