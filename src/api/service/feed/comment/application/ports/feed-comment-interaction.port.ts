import type {
    FeedCommentCreateResult,
    FeedCommentListResult,
    FeedCommentUpdateResult,
    FeedReplyListResult,
} from '../types/feed-comment-result.type';

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
