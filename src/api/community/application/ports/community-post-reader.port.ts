import type {
    CommunityPostCommentListQuery,
    CommunityPostCommentSnapshot,
    CommunityPostListQuery,
    CommunityPostSnapshot,
} from '../types/community-post.type';

export const COMMUNITY_POST_READER_PORT = Symbol('COMMUNITY_POST_READER_PORT');

export interface CommunityPostListResult {
    snapshots: CommunityPostSnapshot[];
    totalItems: number;
}

export interface CommunityPostCommentListResult {
    snapshots: CommunityPostCommentSnapshot[];
    totalItems: number;
}

export interface CommunityPostReaderPort {
    listPosts(query: CommunityPostListQuery): Promise<CommunityPostListResult>;
    readPostById(postId: string): Promise<CommunityPostSnapshot | null>;
    listComments(query: CommunityPostCommentListQuery): Promise<CommunityPostCommentListResult>;
}
