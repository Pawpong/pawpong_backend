import { Inject, Injectable } from '@nestjs/common';

import { PROFILE_FOLLOW_PORT, type ProfileFollowPort } from '../ports/profile-follow.port';

@Injectable()
export class UnfollowUserUseCase {
    constructor(
        @Inject(PROFILE_FOLLOW_PORT)
        private readonly follow: ProfileFollowPort,
    ) {}

    execute(followerId: string, followeeId: string): Promise<{ wasFollowing: boolean }> {
        return this.follow.unfollow(followerId, followeeId);
    }
}
