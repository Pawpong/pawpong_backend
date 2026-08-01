import { Inject, Injectable } from '@nestjs/common';

import { ProfileMapperService } from '../../domain/services/profile-mapper.service';
import { PROFILE_FOLLOW_PORT, type ProfileFollowPort } from '../ports/profile-follow.port';
import { toFollowUsersPage, type FollowUsersPage } from './get-user-followers.use-case';

/**
 * GET /v2/profile/users/:userId/followings — 친구 목록 모달 "팔로잉" 탭.
 */
@Injectable()
export class GetUserFollowingsUseCase {
    constructor(
        @Inject(PROFILE_FOLLOW_PORT)
        private readonly follow: ProfileFollowPort,
        private readonly mapper: ProfileMapperService,
    ) {}

    async execute(userId: string, page = 1, pageSize = 20, viewerId?: string): Promise<FollowUsersPage> {
        const result = await this.follow.listFollowings(userId, { page, pageSize }, viewerId);
        return toFollowUsersPage(result, this.mapper, page, pageSize);
    }
}
