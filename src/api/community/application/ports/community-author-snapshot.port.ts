export const COMMUNITY_AUTHOR_SNAPSHOT_PORT = Symbol('COMMUNITY_AUTHOR_SNAPSHOT_PORT');

/**
 * 커뮤니티 작성자 denormalized snapshot 쓰기 경계.
 * 외부(프로필 변경 이벤트)에서 닉네임/프로필 이미지 변경 시 게시글·댓글 스냅샷을 동기화한다.
 */
export interface CommunityAuthorSnapshotPort {
    syncAuthorSnapshots(
        authorId: string,
        patch: { nickname?: string; profileImageFileName?: string },
    ): Promise<{ postsModified: number; commentsModified: number }>;
}
