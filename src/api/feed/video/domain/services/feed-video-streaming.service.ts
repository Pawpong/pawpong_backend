import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';

export interface FeedVideoProxyTarget {
    fileKey: string;
    cacheKey: string;
    contentType: string;
    cacheControl: string;
    ttlSeconds: number;
    cacheKind: 'binary' | 'text';
}

export interface FeedVideoSegmentTarget {
    filename: string;
    fileKey: string;
    cacheKey: string;
    ttlSeconds: number;
}

@Injectable()
export class FeedVideoStreamingService {
    private static readonly DEFAULT_RESOLUTIONS = [360, 480, 720];
    private static readonly SEGMENT_CACHE_TTL_SECONDS = 3600;

    getProxyTarget(videoId: string, filename: string): FeedVideoProxyTarget {
        const dotIndex = filename.lastIndexOf('.');
        const extension = dotIndex >= 0 ? filename.substring(dotIndex) : '';

        if (extension === '.ts') {
            return {
                fileKey: this.getStreamFileKey(videoId, filename),
                cacheKey: this.getStreamCacheKey(videoId, filename),
                contentType: 'video/mp2t',
                cacheControl: 'public, max-age=86400',
                ttlSeconds: FeedVideoStreamingService.SEGMENT_CACHE_TTL_SECONDS,
                cacheKind: 'binary',
            };
        }

        if (extension === '.m3u8') {
            return {
                fileKey: this.getStreamFileKey(videoId, filename),
                cacheKey: this.getStreamCacheKey(videoId, filename),
                contentType: 'application/vnd.apple.mpegurl',
                cacheControl: 'public, max-age=3600',
                ttlSeconds: 1800,
                cacheKind: 'text',
            };
        }

        throw new DomainValidationError('허용되지 않은 파일 형식입니다.');
    }

    getPreloadTargets(videoId: string, resolutions: number[] = FeedVideoStreamingService.DEFAULT_RESOLUTIONS): FeedVideoSegmentTarget[] {
        return resolutions.flatMap((height) =>
            Array.from({ length: 3 }, (_, index) => this.createSegmentTarget(videoId, height, index)),
        );
    }

    getPrefetchTargets(
        videoId: string,
        currentSegment: number,
        count: number = 5,
        resolutions: number[] = FeedVideoStreamingService.DEFAULT_RESOLUTIONS,
    ): FeedVideoSegmentTarget[] {
        return resolutions.flatMap((height) =>
            Array.from({ length: count }, (_, index) => this.createSegmentTarget(videoId, height, currentSegment + index)),
        );
    }

    private createSegmentTarget(videoId: string, height: number, segmentNumber: number): FeedVideoSegmentTarget {
        const filename = `stream_${height}p_${String(segmentNumber).padStart(3, '0')}.ts`;

        return {
            filename,
            fileKey: this.getStreamFileKey(videoId, filename),
            cacheKey: this.getStreamCacheKey(videoId, filename),
            ttlSeconds: FeedVideoStreamingService.SEGMENT_CACHE_TTL_SECONDS,
        };
    }

    private getStreamFileKey(videoId: string, filename: string): string {
        return `videos/hls/${videoId}/${filename}`;
    }

    private getStreamCacheKey(videoId: string, filename: string): string {
        return `hls:${videoId}:${filename}`;
    }
}
