import type {
    FeedCommentCreateResult,
    FeedCommentListResult,
    FeedCommentUpdateResult,
    FeedReplyListResult,
} from '../types/feed-comment-result.type';

export const CREATE_FEED_VIDEO_COMMENT_USE_CASE = Symbol('CREATE_FEED_VIDEO_COMMENT_USE_CASE');
export const GET_FEED_VIDEO_COMMENTS_USE_CASE = Symbol('GET_FEED_VIDEO_COMMENTS_USE_CASE');
export const GET_FEED_VIDEO_REPLIES_USE_CASE = Symbol('GET_FEED_VIDEO_REPLIES_USE_CASE');
export const UPDATE_FEED_VIDEO_COMMENT_USE_CASE = Symbol('UPDATE_FEED_VIDEO_COMMENT_USE_CASE');
export const DELETE_FEED_VIDEO_COMMENT_USE_CASE = Symbol('DELETE_FEED_VIDEO_COMMENT_USE_CASE');

export interface CreateFeedVideoCommentUseCasePort {
    execute(
        videoId: string,
        userId: string,
        userModel: 'Breeder' | 'Adopter',
        content: string,
        parentId?: string,
    ): Promise<FeedCommentCreateResult>;
}

export interface GetFeedVideoCommentsUseCasePort {
    execute(videoId: string, userId?: string, page?: number, limit?: number): Promise<FeedCommentListResult>;
}

export interface GetFeedVideoRepliesUseCasePort {
    execute(commentId: string, userId?: string, page?: number, limit?: number): Promise<FeedReplyListResult>;
}

export interface UpdateFeedVideoCommentUseCasePort {
    execute(commentId: string, userId: string, content: string): Promise<FeedCommentUpdateResult>;
}

export interface DeleteFeedVideoCommentUseCasePort {
    execute(commentId: string, userId: string): Promise<{ success: true }>;
}
