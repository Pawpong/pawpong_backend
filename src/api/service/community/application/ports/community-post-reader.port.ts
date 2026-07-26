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
    readPostsByIds(postIds: string[]): Promise<CommunityPostSnapshot[]>;
    existsActivePost(postId: string): Promise<boolean>;
    listComments(query: CommunityPostCommentListQuery): Promise<CommunityPostCommentListResult>;
    /**
     * 게시글별 최신 댓글 1건 (피드 카드 미리보기용).
     * 목록 응답이 카드마다 상세를 다시 호출하지 않도록 한 번에 모아 온다.
     */
    listLatestCommentPerPost(postIds: string[]): Promise<CommunityPostCommentSnapshot[]>;
}
