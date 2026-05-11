/**
 * v2 커뮤니티 — application 계층 내부 타입.
 */

export type CommunityPetType = 'dog' | 'cat' | 'reptile';
export type CommunityPostSort = 'latest' | 'popular';
export type CommunityAuthorModel = 'Adopter' | 'Breeder';

export interface CommunityPostSnapshot {
    postId: string;
    authorId: string;
    authorModel: CommunityAuthorModel;
    authorNickname: string;
    authorProfileImageFileName?: string;
    title?: string;
    body: string;
    photos: string[];
    petType?: CommunityPetType;
    category?: string;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    viewCount: number;
    createdAt: Date;
}

export interface CommunityPostCommentSnapshot {
    commentId: string;
    postId: string;
    authorId: string;
    authorModel: CommunityAuthorModel;
    authorNickname: string;
    authorProfileImageFileName?: string;
    parentCommentId: string | null;
    body: string;
    likeCount: number;
    createdAt: Date;
}

export interface CommunityPostListQuery {
    petType?: CommunityPetType;
    category?: string;
    sort: CommunityPostSort;
    skip: number;
    limit: number;
}

export interface CommunityPostCommentListQuery {
    postId: string;
    skip: number;
    limit: number;
}
