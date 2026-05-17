export const PROFILE_FOLLOW_PORT = Symbol('PROFILE_FOLLOW_PORT');

export interface ProfileFollowPort {
    /**
     * 팔로우. 이미 팔로우 중이면 alreadyFollowing: true (멱등).
     * 새 팔로우 시 followee 의 followerCount += 1.
     */
    follow(followerId: string, followeeId: string): Promise<{ alreadyFollowing: boolean }>;

    /**
     * 팔로우 취소. 팔로우 중이 아니면 wasFollowing: false (멱등).
     * 취소 시 followee 의 followerCount -= 1 (0 미만 방지).
     */
    unfollow(followerId: string, followeeId: string): Promise<{ wasFollowing: boolean }>;

    /**
     * followerId 가 followeeId 를 현재 팔로우 중인지 확인.
     */
    isFollowing(followerId: string, followeeId: string): Promise<boolean>;
}
