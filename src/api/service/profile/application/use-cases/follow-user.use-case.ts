import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PROFILE_FOLLOW_PORT, type ProfileFollowPort } from '../ports/profile-follow.port';
import { PROFILE_READER_PORT, type ProfileReaderPort } from '../ports/profile-reader.port';

@Injectable()
export class FollowUserUseCase {
    constructor(
        @Inject(PROFILE_READER_PORT)
        private readonly reader: ProfileReaderPort,
        @Inject(PROFILE_FOLLOW_PORT)
        private readonly follow: ProfileFollowPort,
    ) {}

    async execute(followerId: string, followeeId: string): Promise<{ alreadyFollowing: boolean }> {
        if (followerId === followeeId) {
            throw new BadRequestException('자기 자신을 팔로우할 수 없습니다.');
        }

        const target = await this.reader.readAdopter(followeeId);
        if (!target) {
            throw new BadRequestException('해당 사용자를 찾을 수 없습니다.');
        }

        return this.follow.follow(followerId, followeeId);
    }
}
