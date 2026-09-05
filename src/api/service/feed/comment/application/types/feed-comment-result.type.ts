export interface FeedCommentAuthorResult {
    _id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
}

export interface FeedCommentItemResult {
    commentId: string;
    content: string;
    author: FeedCommentAuthorResult | null;
    parentId?: string;
    likeCount: number;
    replyCount: number;
    createdAt: Date;
    isOwner: boolean;
}

export interface FeedCommentListResult {
    comments: FeedCommentItemResult[];
    totalCount: number;
    hasNextPage: boolean;
}

export interface FeedReplyItemResult {
    commentId: string;
    content: string;
    author: FeedCommentAuthorResult | null;
    likeCount: number;
    createdAt: Date;
    isOwner: boolean;
}

export interface FeedReplyListResult {
    replies: FeedReplyItemResult[];
    totalCount: number;
    hasNextPage: boolean;
}

export interface FeedCommentCreateResult {
    commentId: string;
    content: string;
    createdAt: Date;
}

export interface FeedCommentUpdateResult {
    commentId: string;
    content: string;
    updatedAt?: Date;
}
