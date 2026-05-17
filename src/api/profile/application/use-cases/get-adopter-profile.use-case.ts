import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ProfileMapperService } from '../../domain/services/profile-mapper.service';
import { PROFILE_FOLLOW_PORT, type ProfileFollowPort } from '../ports/profile-follow.port';
import { PROFILE_READER_PORT, type ProfileReaderPort } from '../ports/profile-reader.port';
import type { AdopterPublicProfileResult } from '../types/profile-result.type';

/**
 * GET /v2/profile/users/:userId — 다른 입양자의 공개 프로필 (유저홈).
 */
@Injectable()
export class GetAdopterProfileUseCase {
    constructor(
        @Inject(PROFILE_READER_PORT)
        private readonly reader: ProfileReaderPort,
        @Inject(PROFILE_FOLLOW_PORT)
        private readonly follow: ProfileFollowPort,
        private readonly mapper: ProfileMapperService,
    ) {}

    async execute(targetUserId: string, viewerUserId?: string): Promise<AdopterPublicProfileResult> {
        const adopter = await this.reader.readAdopter(targetUserId);
        if (!adopter) throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');

        const isFollowing =
            viewerUserId && viewerUserId !== targetUserId
                ? await this.follow.isFollowing(viewerUserId, targetUserId)
                : false;

        return this.mapper.toAdopterPublicDto(adopter, isFollowing);
    }
}
