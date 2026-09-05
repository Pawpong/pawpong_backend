import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ProfileMapperService } from '../../domain/services/profile-mapper.service';
import { PROFILE_FOLLOW_PORT, type ProfileFollowPort } from '../ports/profile-follow.port';
import { PROFILE_READER_PORT, type ProfileReaderPort } from '../ports/profile-reader.port';
import type { BreederPublicProfileResult } from '../types/profile-result.type';

/**
 * GET /v2/profile/breeders/:breederId — 브리더 공개 프로필 (브리더홈).
 * isFavorited 는 로그인한 입양자에게만, isFollowing 은 로그인 사용자 누구에게나 채워준다.
 * (비로그인/본인 호출은 false)
 */
@Injectable()
export class GetBreederProfileUseCase {
    constructor(
        @Inject(PROFILE_READER_PORT)
        private readonly reader: ProfileReaderPort,
        @Inject(PROFILE_FOLLOW_PORT)
        private readonly follow: ProfileFollowPort,
        private readonly mapper: ProfileMapperService,
    ) {}

    async execute(breederId: string, viewerUserId?: string, viewerRole?: string): Promise<BreederPublicProfileResult> {
        const breeder = await this.reader.readBreeder(breederId);
        if (!breeder) throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');

        const [isFavorited, isFollowing] = await Promise.all([
            viewerUserId && viewerRole === 'adopter'
                ? this.reader.isFavoritedBy(viewerUserId, breederId)
                : Promise.resolve(false),
            viewerUserId && viewerUserId !== breederId
                ? this.follow.isFollowing(viewerUserId, breederId)
                : Promise.resolve(false),
        ]);

        return this.mapper.toBreederPublicDto(breeder, isFavorited, isFollowing);
    }
}
