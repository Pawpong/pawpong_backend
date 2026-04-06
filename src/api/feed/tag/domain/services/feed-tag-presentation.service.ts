import { Injectable } from '@nestjs/common';

import { FeedTagUploaderSnapshot, FeedTagVideoSnapshot } from '../../application/ports/feed-tag-reader.port';

type ThumbnailUrlResolver = (fileKey?: string) => string | Promise<string | null> | null;

@Injectable()
export class FeedTagPresentationService {
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

    private toUploaderResponse(uploader: FeedTagUploaderSnapshot | null): any {
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
