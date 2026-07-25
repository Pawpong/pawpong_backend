import { Injectable } from '@nestjs/common';

import type { FollowUsersPageResult, ProfileFollowPort } from '../application/ports/profile-follow.port';
import type { FollowUserCardSnapshot } from '../application/types/profile.type';
import { ProfileFollowRepository, type FollowDirection } from '../repository/profile-follow.repository';
import { ProfileRepository } from '../repository/profile.repository';

/** 팔로우 상대방의 표시 정보 (입양자/브리더 문서에서 공통 추출) */
type FollowCounterpartProfile = {
    nickname: string;
    profileImageFileName?: string;
    bio: string;
};

@Injectable()
export class ProfileFollowMongooseAdapter implements ProfileFollowPort {
    constructor(
        private readonly repository: ProfileFollowRepository,
        private readonly profileRepository: ProfileRepository,
    ) {}

    follow(followerId: string, followeeId: string): Promise<{ alreadyFollowing: boolean }> {
        return this.repository.follow(followerId, followeeId);
    }

    unfollow(followerId: string, followeeId: string): Promise<{ wasFollowing: boolean }> {
        return this.repository.unfollow(followerId, followeeId);
    }

    isFollowing(followerId: string, followeeId: string): Promise<boolean> {
        return this.repository.isFollowing(followerId, followeeId);
    }

    removeFollower(userId: string, followerId: string): Promise<{ wasFollowing: boolean }> {
        return this.repository.removeFollower(userId, followerId);
    }

    listFollowers(
        userId: string,
        pagination: { page: number; pageSize: number },
        viewerId?: string,
    ): Promise<FollowUsersPageResult> {
        return this.listRelated(userId, 'followers', pagination, viewerId);
    }

    listFollowings(
        userId: string,
        pagination: { page: number; pageSize: number },
        viewerId?: string,
    ): Promise<FollowUsersPageResult> {
        return this.listRelated(userId, 'followings', pagination, viewerId);
    }

    /**
     * 팔로우 관계 문서 → 상대방 프로필 조회 → viewer 기준 관계 플래그 결합 순으로 스냅샷을 조립한다.
     * (repository 는 raw 문서만 반환하고, 스냅샷 매핑은 어댑터가 담당한다)
     */
    private async listRelated(
        userId: string,
        direction: FollowDirection,
        pagination: { page: number; pageSize: number },
        viewerId?: string,
    ): Promise<FollowUsersPageResult> {
        const [edges, totalItems] = await Promise.all([
            this.repository.findFollowEdges(userId, direction, pagination),
            this.repository.countFollowEdges(userId, direction),
        ]);

        if (edges.length === 0) {
            return { items: [], totalItems };
        }

        // 상대방 ID — 팔로워 목록이면 followerId, 팔로잉 목록이면 followeeId
        const counterpartIds = edges.map((edge) => (direction === 'followers' ? edge.followerId : edge.followeeId));

        const [profiles, followingIds, followerIds] = await Promise.all([
            this.findCounterpartProfiles(counterpartIds),
            viewerId ? this.repository.findFollowingIdsAmong(viewerId, counterpartIds) : Promise.resolve([]),
            viewerId ? this.repository.findFollowerIdsAmong(viewerId, counterpartIds) : Promise.resolve([]),
        ]);
        const followingSet = new Set(followingIds);
        const followerSet = new Set(followerIds);

        const items = edges.reduce<FollowUserCardSnapshot[]>((acc, edge) => {
            const counterpartId = direction === 'followers' ? edge.followerId : edge.followeeId;
            const profile = profiles.get(counterpartId);
            // 탈퇴 등으로 사용자 문서가 없으면 목록에서 제외
            if (!profile) return acc;

            acc.push({
                userId: counterpartId,
                nickname: profile.nickname,
                profileImageFileName: profile.profileImageFileName,
                bio: profile.bio,
                isFollowing: followingSet.has(counterpartId),
                isFollowedBy: followerSet.has(counterpartId),
                followedAt: edge.createdAt,
            });
            return acc;
        }, []);

        return { items, totalItems };
    }

    /** 팔로우 주체는 입양자·브리더 모두 가능하므로 두 컬렉션에서 표시 정보를 모은다 */
    private async findCounterpartProfiles(userIds: string[]): Promise<Map<string, FollowCounterpartProfile>> {
        const [adopters, breeders] = await Promise.all([
            this.profileRepository.findAdoptersByIds(userIds),
            this.profileRepository.findBreedersByIds(userIds),
        ]);

        const profiles = new Map<string, FollowCounterpartProfile>();
        adopters.forEach((adopter) => {
            profiles.set(String(adopter._id), {
                nickname: adopter.nickname,
                profileImageFileName: adopter.profileImageFileName,
                bio: adopter.bio ?? '',
            });
        });
        breeders.forEach((breeder) => {
            profiles.set(String(breeder._id), {
                nickname: breeder.nickname,
                profileImageFileName: breeder.profileImageFileName ?? undefined,
                bio: breeder.bio ?? '',
            });
        });

        return profiles;
    }
}
