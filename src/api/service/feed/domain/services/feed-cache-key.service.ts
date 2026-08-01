import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedCacheKeyService {
    getVideoMetaKey(videoId: string): string {
        return `video:meta:${videoId}`;
    }

    getVideoCommentsKey(videoId: string): string {
        return `video:comments:${videoId}`;
    }

    getFeedKey(page: number, limit: number): string {
        return `video:feed:${page}:${limit}`;
    }

    getPopularVideosKey(limit: number): string {
        return `video:popular:${limit}`;
    }

    getPopularTagsKey(limit: number): string {
        return `video:popular-tags:${limit}`;
    }

    getTagSearchKey(tag: string, page: number, limit: number): string {
        return `video:tag:${tag}:${page}:${limit}`;
    }

    getSignedUrlKey(fileKey: string): string {
        return `signed-url:${fileKey}`;
    }
}
