import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserFollow, UserFollowDocument } from '../../../../schema/user-follow.schema';
import type { CommunityFollowReaderPort } from '../application/ports/community-follow-reader.port';

/**
 * 공유 스키마 user_follows 를 커뮤니티 경계 안에서 읽기 전용으로 캡슐화한다.
 * (팔로우 쓰기/카운트 동기화는 profile 도메인 소관이며 여기서는 관계 조회만 한다.)
 */
@Injectable()
export class CommunityFollowReaderMongooseAdapter implements CommunityFollowReaderPort {
    constructor(
        @InjectModel(UserFollow.name)
        private readonly followModel: Model<UserFollowDocument>,
    ) {}

    async listFolloweeIds(followerId: string): Promise<string[]> {
        const rows = await this.followModel
            .find({ followerId })
            .select({ followeeId: 1, _id: 0 })
            .lean<{ followeeId: string }[]>()
            .exec();
        return rows.map((row) => row.followeeId);
    }

    async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
        const found = await this.followModel.exists({ followerId, followeeId });
        return Boolean(found);
    }
}
