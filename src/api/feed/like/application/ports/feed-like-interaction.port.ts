import type {
    FeedLikeStatusResult,
    FeedLikeToggleResult,
    FeedMyLikedVideosResult,
} from '../types/feed-like-result.type';

export const TOGGLE_FEED_VIDEO_LIKE_USE_CASE = Symbol('TOGGLE_FEED_VIDEO_LIKE_USE_CASE');
export const GET_FEED_VIDEO_LIKE_STATUS_USE_CASE = Symbol('GET_FEED_VIDEO_LIKE_STATUS_USE_CASE');
export const GET_MY_LIKED_FEED_VIDEOS_USE_CASE = Symbol('GET_MY_LIKED_FEED_VIDEOS_USE_CASE');

export interface ToggleFeedVideoLikeUseCasePort {
    execute(videoId: string, userId: string, userModel: 'Breeder' | 'Adopter'): Promise<FeedLikeToggleResult>;
}

export interface GetFeedVideoLikeStatusUseCasePort {
    execute(videoId: string, userId: string): Promise<FeedLikeStatusResult>;
}

export interface GetMyLikedFeedVideosUseCasePort {
    execute(userId: string, page?: number, limit?: number): Promise<FeedMyLikedVideosResult>;
}
