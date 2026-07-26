import type {
    FeedLikeStatusResult,
    FeedLikeToggleResult,
    FeedMyLikedVideosResult,
} from '../types/feed-like-result.type';

export interface ToggleFeedVideoLikeUseCasePort {
    execute(videoId: string, userId: string, userModel: 'Breeder' | 'Adopter'): Promise<FeedLikeToggleResult>;
}

export interface GetFeedVideoLikeStatusUseCasePort {
    execute(videoId: string, userId: string): Promise<FeedLikeStatusResult>;
}

export interface GetMyLikedFeedVideosUseCasePort {
    execute(userId: string, page?: number, limit?: number): Promise<FeedMyLikedVideosResult>;
}
