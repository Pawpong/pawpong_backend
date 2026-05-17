import { Injectable } from '@nestjs/common';

import type { ProfileFollowPort } from '../application/ports/profile-follow.port';
import { ProfileFollowRepository } from '../repository/profile-follow.repository';

@Injectable()
export class ProfileFollowMongooseAdapter implements ProfileFollowPort {
    constructor(private readonly repository: ProfileFollowRepository) {}

    follow(followerId: string, followeeId: string): Promise<{ alreadyFollowing: boolean }> {
        return this.repository.follow(followerId, followeeId);
    }

    unfollow(followerId: string, followeeId: string): Promise<{ wasFollowing: boolean }> {
        return this.repository.unfollow(followerId, followeeId);
    }

    isFollowing(followerId: string, followeeId: string): Promise<boolean> {
        return this.repository.isFollowing(followerId, followeeId);
    }
}
