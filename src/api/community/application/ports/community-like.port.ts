import type { CommunityAuthorModel } from '../types/community-post.type';

export const COMMUNITY_LIKE_PORT = Symbol('COMMUNITY_LIKE_PORT');

export interface CommunityLikePort {
    /**
     * 좋아요 등록. 이미 좋아요한 경우 alreadyLiked: true 반환 (멱등).
     * 신규 좋아요 시 community_posts.likeCount += 1.
     */
    like(postId: string, userId: string, userModel: CommunityAuthorModel): Promise<{ alreadyLiked: boolean }>;

    /**
     * 좋아요 취소. 좋아요하지 않은 경우 wasLiked: false 반환 (멱등).
     * 취소 시 community_posts.likeCount -= 1 (0 미만 방지).
     */
    unlike(postId: string, userId: string): Promise<{ wasLiked: boolean }>;

    /**
     * 단일 게시글에 대한 현재 유저의 좋아요 여부.
     */
    isLiked(userId: string, postId: string): Promise<boolean>;

    /**
     * 게시글 ID 목록 중 현재 유저가 좋아요한 postId Set.
     * 목록 렌더링 시 isLiked 플래그 계산용.
     */
    findLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>>;
}
