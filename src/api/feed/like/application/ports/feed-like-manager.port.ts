export interface FeedLikeUploaderSnapshot {
    id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
}

export interface FeedLikeVideoSnapshot {
    id: string;
    title: string;
    thumbnailKey?: string;
    duration: number;
    viewCount: number;
    likeCount: number;
    uploadedBy: FeedLikeUploaderSnapshot | null;
    createdAt: Date;
}

export interface FeedLikeVideoCounterSnapshot {
    id: string;
    likeCount: number;
}

export interface FeedLikeSnapshot {
    id: string;
    videoId: string;
    userId: string;
}

export const FEED_LIKE_MANAGER_PORT = Symbol('FEED_LIKE_MANAGER_PORT');

export interface FeedLikeManagerPort {
    findVideoCounter(videoId: string): Promise<FeedLikeVideoCounterSnapshot | null>;
    findUserLike(videoId: string, userId: string): Promise<FeedLikeSnapshot | null>;
    createLike(data: { videoId: string; userId: string; userModel: 'Breeder' | 'Adopter' }): Promise<void>;
    deleteLike(likeId: string): Promise<void>;
    updateVideoLikeCount(videoId: string, delta: number): Promise<number>;
    readMyLikedVideos(userId: string, skip: number, limit: number): Promise<FeedLikeVideoSnapshot[]>;
    countMyLikedVideos(userId: string): Promise<number>;
}
