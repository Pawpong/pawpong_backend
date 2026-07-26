export interface FeedTagUploaderSnapshot {
    id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
}

export interface FeedTagVideoSnapshot {
    id: string;
    title: string;
    thumbnailKey?: string;
    duration: number;
    viewCount: number;
    likeCount: number;
    tags: string[];
    uploadedBy: FeedTagUploaderSnapshot | null;
    createdAt: Date;
}

export interface FeedPopularTagSnapshot {
    tag: string;
    videoCount: number;
    totalViews: number;
}

export interface FeedTagSuggestionSnapshot {
    tag: string;
    videoCount: number;
}

export const FEED_TAG_READER_PORT = Symbol('FEED_TAG_READER_PORT');

export interface FeedTagReaderPort {
    readByTag(tag: string, skip: number, limit: number): Promise<FeedTagVideoSnapshot[]>;
    countByTag(tag: string): Promise<number>;
    readPopularTags(limit: number): Promise<FeedPopularTagSnapshot[]>;
    suggestTags(query: string, limit: number): Promise<FeedTagSuggestionSnapshot[]>;
}
