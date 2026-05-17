import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { UserFollow, UserFollowDocument } from '../../../schema/user-follow.schema';

@Injectable()
export class ProfileFollowRepository {
    constructor(
        @InjectModel(UserFollow.name)
        private readonly followModel: Model<UserFollowDocument>,
        @InjectModel(Adopter.name)
        private readonly adopterModel: Model<AdopterDocument>,
    ) {}

    async follow(followerId: string, followeeId: string): Promise<{ alreadyFollowing: boolean }> {
        try {
            await this.followModel.create({ followerId, followeeId });
            // followee 의 followerCount 증가 (Adopter 만 팔로우 대상)
            await this.adopterModel
                .updateOne({ _id: new Types.ObjectId(followeeId) }, { $inc: { followerCount: 1 } })
                .exec();
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

        // followerCount 0 미만 방지
        await this.adopterModel
            .updateOne(
                { _id: new Types.ObjectId(followeeId), followerCount: { $gt: 0 } },
                { $inc: { followerCount: -1 } },
            )
            .exec();

        return { wasFollowing: true };
    }

    async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
        const found = await this.followModel.exists({ followerId, followeeId });
        return Boolean(found);
    }
}
