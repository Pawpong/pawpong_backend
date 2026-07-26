import { Inject, Injectable } from '@nestjs/common';

import { PROFILE_FOLLOW_PORT, type ProfileFollowPort } from '../ports/profile-follow.port';

/**
 * DELETE /v2/profile/me/followers/:userId — 친구 목록 모달의 팔로워 "삭제".
 * 상대가 나를 팔로우한 관계를 내가 끊는다(멱등).
 */
@Injectable()
export class RemoveMyFollowerUseCase {
    constructor(
        @Inject(PROFILE_FOLLOW_PORT)
        private readonly follow: ProfileFollowPort,
    ) {}

    execute(userId: string, followerId: string): Promise<{ wasFollowing: boolean }> {
        return this.follow.removeFollower(userId, followerId);
    }
}
