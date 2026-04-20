import type { PageInfoResult } from '../../../../../common/types/page-result.type';

export interface FeedTagUploaderResult {
    _id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
}

export interface FeedPopularTagResult {
    tag: string;
    videoCount: number;
    totalViews: number;
}

export interface FeedTagSuggestionResult {
    tag: string;
    videoCount: number;
}

export interface FeedTagSearchVideoItemResult {
    videoId: string;
    title: string;
    thumbnailUrl?: string | null;
    duration: number;
    viewCount: number;
    likeCount: number;
    tags: string[];
    uploadedBy?: FeedTagUploaderResult | null;
    createdAt: Date;
}

export interface FeedTagSearchResult {
    videos: FeedTagSearchVideoItemResult[];
    tag: string;
    pagination: PageInfoResult;
}
