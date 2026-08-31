import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { UserFollow, UserFollowDocument } from '../../../../schema/user-follow.schema';

/** 팔로우 관계 조회 방향 — followers: 나를 팔로우 / followings: 내가 팔로우 */
export type FollowDirection = 'followers' | 'followings';

@Injectable()
export class ProfileFollowRepository {
    constructor(
        @InjectModel(UserFollow.name)
        private readonly followModel: Model<UserFollowDocument>,
        @InjectModel(Adopter.name)
        private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name)
        private readonly breederModel: Model<BreederDocument>,
    ) {}

    async follow(followerId: string, followeeId: string): Promise<{ alreadyFollowing: boolean }> {
        try {
            await this.followModel.create({ followerId, followeeId });
            await Promise.all([
                this.bumpCounter(followeeId, 'followerCount', 1),
                this.bumpCounter(followerId, 'followingCount', 1),
            ]);
            return { alreadyFollowing: false };
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
                return { alreadyFollowing: true };
            }
            throw err;
        }
    }

    async unfollow(followerId: string, followeeId: string): Promise<{ wasFollowing: boolean }> {
        const result = await this.followModel.deleteOne({ followerId, followeeId }).exec();
        if (result.deletedCount === 0) {
            return { wasFollowing: false };
        }

        await this.decreaseCounters(followerId, followeeId);
        return { wasFollowing: true };
    }

    /**
     * 내 팔로워 삭제 — 상대(followerId) → 나(userId) 관계를 끊는다.
     * unfollow 와 방향만 반대이고 카운터 갱신 규칙은 동일하다.
     */
    async removeFollower(userId: string, followerId: string): Promise<{ wasFollowing: boolean }> {
        const result = await this.followModel.deleteOne({ followerId, followeeId: userId }).exec();
        if (result.deletedCount === 0) {
            return { wasFollowing: false };
        }

        await this.decreaseCounters(followerId, userId);
        return { wasFollowing: true };
    }

    async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
        const found = await this.followModel.exists({ followerId, followeeId });
        return Boolean(found);
    }

    /** 팔로우 관계 문서 페이지 조회 (최신 팔로우 순) */
    async findFollowEdges(
        userId: string,
        direction: FollowDirection,
        pagination: { page: number; pageSize: number },
    ): Promise<UserFollowDocument[]> {
        const skip = (pagination.page - 1) * pagination.pageSize;
        return this.followModel
            .find(this.toDirectionFilter(userId, direction))
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pagination.pageSize)
            .lean<UserFollowDocument[]>()
            .exec();
    }

    /** 팔로우 관계 총 개수 */
    async countFollowEdges(userId: string, direction: FollowDirection): Promise<number> {
        return this.followModel.countDocuments(this.toDirectionFilter(userId, direction)).exec();
    }

    /** candidateIds 중 viewer 가 팔로우 중인 사용자 ID 목록 */
    async findFollowingIdsAmong(viewerId: string, candidateIds: string[]): Promise<string[]> {
        if (candidateIds.length === 0) return [];
        const edges = await this.followModel
            .find({ followerId: viewerId, followeeId: { $in: candidateIds } })
            .select('followeeId')
            .lean<Pick<UserFollowDocument, 'followeeId'>[]>()
            .exec();
        return edges.map((edge) => edge.followeeId);
    }

    /** candidateIds 중 viewer 를 팔로우 중인 사용자 ID 목록 */
    async findFollowerIdsAmong(viewerId: string, candidateIds: string[]): Promise<string[]> {
        if (candidateIds.length === 0) return [];
        const edges = await this.followModel
            .find({ followeeId: viewerId, followerId: { $in: candidateIds } })
            .select('followerId')
            .lean<Pick<UserFollowDocument, 'followerId'>[]>()
            .exec();
        return edges.map((edge) => edge.followerId);
    }

    private toDirectionFilter(userId: string, direction: FollowDirection) {
        return direction === 'followers' ? { followeeId: userId } : { followerId: userId };
    }

    /** 팔로우 해제 시 양쪽 카운터 감소 (0 미만 방지) */
    private async decreaseCounters(followerId: string, followeeId: string): Promise<void> {
        await Promise.all([
            this.bumpCounter(followeeId, 'followerCount', -1),
            this.bumpCounter(followerId, 'followingCount', -1),
        ]);
    }

    /**
     * 팔로우 카운터 증감 — 입양자·브리더 어느 쪽도 팔로우 주체/대상이 될 수 있어
     * 두 컬렉션에 같은 증감을 시도한다 (_id 는 컬렉션 간 겹치지 않으므로 한쪽만 매칭된다).
     * 브리더는 stats 하위에 카운터를 둔다.
     */
    private async bumpCounter(userId: string, field: 'followerCount' | 'followingCount', delta: 1 | -1): Promise<void> {
        const _id = new Types.ObjectId(userId);
        const positive = delta < 0 ? { $gt: 0 } : undefined;
        await Promise.all([
            this.adopterModel
                .updateOne({ _id, ...(positive ? { [field]: positive } : {}) }, { $inc: { [field]: delta } })
                .exec(),
            this.breederModel
                .updateOne(
                    { _id, ...(positive ? { [`stats.${field}`]: positive } : {}) },
                    { $inc: { [`stats.${field}`]: delta } },
                )
                .exec(),
        ]);
    }
}
