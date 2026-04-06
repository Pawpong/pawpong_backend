export interface FeedCommentAuthorSnapshot {
    id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
}

export interface FeedCommentSnapshot {
    id: string;
    videoId: string;
    userId: string;
    content: string;
    parentId?: string;
    likeCount: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt?: Date;
    author: FeedCommentAuthorSnapshot | null;
}

export interface FeedCommentReplyCountSnapshot {
    commentId: string;
    count: number;
}

export const FEED_COMMENT_MANAGER = Symbol('FEED_COMMENT_MANAGER');

export interface FeedCommentManagerPort {
    findVideo(videoId: string): Promise<{ id: string } | null>;
    findComment(commentId: string): Promise<FeedCommentSnapshot | null>;
    createComment(data: {
        videoId: string;
        userId: string;
        userModel: 'Breeder' | 'Adopter';
        content: string;
        parentId?: string;
    }): Promise<FeedCommentSnapshot>;
    incrementVideoCommentCount(videoId: string, delta: number): Promise<void>;
    readRootComments(videoId: string, skip: number, limit: number): Promise<FeedCommentSnapshot[]>;
    countRootComments(videoId: string): Promise<number>;
    readReplyCounts(parentIds: string[]): Promise<FeedCommentReplyCountSnapshot[]>;
    readReplies(commentId: string, skip: number, limit: number): Promise<FeedCommentSnapshot[]>;
    countReplies(commentId: string): Promise<number>;
    updateCommentContent(commentId: string, content: string): Promise<FeedCommentSnapshot | null>;
    markDeleted(commentId: string): Promise<FeedCommentSnapshot | null>;
}
