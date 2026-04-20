import type { PageInfoResult } from '../../../../../common/types/page-result.type';

export interface FeedLikeUploaderResult {
    _id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
}

export interface FeedLikeToggleResult {
    isLiked: boolean;
    likeCount: number;
}

export interface FeedLikeStatusResult {
    isLiked: boolean;
    likeCount: number;
}

export interface FeedMyLikedVideoItemResult {
    videoId: string;
    title: string;
    thumbnailUrl?: string | null;
    duration: number;
    viewCount: number;
    likeCount: number;
    uploadedBy?: FeedLikeUploaderResult | null;
    createdAt: Date;
}

export interface FeedMyLikedVideosResult {
    videos: FeedMyLikedVideoItemResult[];
    pagination: PageInfoResult;
}
