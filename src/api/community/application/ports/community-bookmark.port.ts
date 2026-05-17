import type { CommunityAuthorModel } from '../types/community-post.type';

export const COMMUNITY_BOOKMARK_PORT = Symbol('COMMUNITY_BOOKMARK_PORT');

export interface CommunityBookmarkPort {
    /**
     * 게시글 저장. 이미 저장된 경우 alreadySaved: true 반환 (멱등).
     * 새로 저장된 경우 community_posts.saveCount += 1.
     */
    save(postId: string, userId: string, userModel: CommunityAuthorModel): Promise<{ alreadySaved: boolean }>;

    /**
     * 게시글 저장 취소. 저장되지 않은 경우 wasSaved: false 반환 (멱등).
     * 취소 시 community_posts.saveCount -= 1 (0 미만 방지).
     */
    unsave(postId: string, userId: string): Promise<{ wasSaved: boolean }>;

    /**
     * 저장된 게시글 ID 목록 (저장일 내림차순).
     * 저장 피드 페이지네이션용.
     */
    listSavedPostIds(userId: string, skip: number, limit: number): Promise<{ postIds: string[]; totalItems: number }>;

    /**
     * 주어진 postId 배열 중 현재 userId 가 저장한 것의 Set.
     * 목록 렌더링 시 isSaved 플래그 계산용.
     */
    findSavedPostIds(userId: string, postIds: string[]): Promise<Set<string>>;
}
