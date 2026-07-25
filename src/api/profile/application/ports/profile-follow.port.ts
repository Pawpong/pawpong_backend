import type { FollowUserCardSnapshot } from '../types/profile.type';

export const PROFILE_FOLLOW_PORT = Symbol('PROFILE_FOLLOW_PORT');

export interface FollowUsersPageResult {
    items: FollowUserCardSnapshot[];
    totalItems: number;
}

export interface ProfileFollowPort {
    /**
     * 팔로우. 이미 팔로우 중이면 alreadyFollowing: true (멱등).
     * 새 팔로우 시 followee 의 followerCount += 1, follower 의 followingCount += 1.
     */
    follow(followerId: string, followeeId: string): Promise<{ alreadyFollowing: boolean }>;

    /**
     * 팔로우 취소. 팔로우 중이 아니면 wasFollowing: false (멱등).
     * 취소 시 followee 의 followerCount -= 1, follower 의 followingCount -= 1 (0 미만 방지).
     */
    unfollow(followerId: string, followeeId: string): Promise<{ wasFollowing: boolean }>;

    /**
     * followerId 가 followeeId 를 현재 팔로우 중인지 확인.
     */
    isFollowing(followerId: string, followeeId: string): Promise<boolean>;

    /**
     * 친구 목록 모달 "팔로워" 탭 — userId 를 팔로우하는 사용자 페이지네이션.
     * viewerId 가 있으면 각 항목의 isFollowing/isFollowedBy 를 채워 맞팔 여부를 판별할 수 있게 한다.
     */
    listFollowers(
        userId: string,
        pagination: { page: number; pageSize: number },
        viewerId?: string,
    ): Promise<FollowUsersPageResult>;

    /**
     * 친구 목록 모달 "팔로잉" 탭 — userId 가 팔로우하는 사용자 페이지네이션.
     */
    listFollowings(
        userId: string,
        pagination: { page: number; pageSize: number },
        viewerId?: string,
    ): Promise<FollowUsersPageResult>;

    /**
     * 내 팔로워 삭제 — 상대(followerId)가 나(userId)를 팔로우한 관계를 끊는다.
     * 팔로우 중이 아니었으면 wasFollowing: false (멱등).
     */
    removeFollower(userId: string, followerId: string): Promise<{ wasFollowing: boolean }>;
}
