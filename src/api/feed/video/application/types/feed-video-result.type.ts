import type { PageInfoResult } from '../../../../../common/types/page-result.type';
import type { VideoStatus } from '../../../../../schema/video.schema';

export interface FeedVideoUploaderResult {
    _id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
}

export interface FeedVideoUploadUrlResult {
    videoId: string;
    uploadUrl: string;
    videoKey: string;
}

export interface FeedVideoItemResult {
    videoId: string;
    title: string;
    thumbnailUrl: string;
    duration: number;
    viewCount: number;
    likeCount?: number;
    uploadedBy: FeedVideoUploaderResult | null;
    createdAt: Date;
}

export interface FeedVideoFeedResult {
    items: FeedVideoItemResult[];
    pagination: PageInfoResult;
}

export interface FeedPopularVideoItemResult {
    videoId: string;
    title: string;
    thumbnailUrl?: string | null;
    duration: number;
    viewCount: number;
    uploadedBy: FeedVideoUploaderResult | null;
}

export interface FeedMyVideoItemResult {
    videoId: string;
    title: string;
    status: VideoStatus;
    thumbnailUrl?: string | null;
    duration: number;
    viewCount: number;
    isPublic: boolean;
    createdAt: Date;
    failureReason?: string;
}

export interface FeedMyVideoListResult {
    items: FeedMyVideoItemResult[];
    pagination: PageInfoResult;
}

export interface FeedPendingVideoMetaResult {
    videoId: string;
    status: VideoStatus;
    title: string;
    failureReason?: string;
}

export interface FeedVideoMetaResult {
    videoId: string;
    title: string;
    description?: string;
    status: VideoStatus;
    playUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    width?: number;
    height?: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    tags?: string[];
    uploadedBy: FeedVideoUploaderResult | null;
    createdAt: Date;
    failureReason?: string;
}

export type FeedVideoMetaQueryResult = FeedVideoMetaResult | FeedPendingVideoMetaResult;

export interface FeedVideoSegmentPrefetchResult {
    success: true;
    message: string;
}
