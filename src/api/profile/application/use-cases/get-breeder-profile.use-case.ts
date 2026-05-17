import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ProfileMapperService } from '../../domain/services/profile-mapper.service';
import { PROFILE_READER_PORT, type ProfileReaderPort } from '../ports/profile-reader.port';
import type { BreederPublicProfileResult } from '../types/profile-result.type';

/**
 * GET /v2/profile/breeders/:breederId — 브리더 공개 프로필 (브리더홈).
 * 로그인한 입양자라면 isFavorited 를 채워주고, 비로그인/브리더 호출은 false 로 둔다.
 */
@Injectable()
export class GetBreederProfileUseCase {
    constructor(
        @Inject(PROFILE_READER_PORT)
        private readonly reader: ProfileReaderPort,
        private readonly mapper: ProfileMapperService,
    ) {}

    async execute(
        breederId: string,
        viewerUserId?: string,
        viewerRole?: string,
    ): Promise<BreederPublicProfileResult> {
        const breeder = await this.reader.readBreeder(breederId);
        if (!breeder) throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');

        let isFavorited = false;
        if (viewerUserId && viewerRole === 'adopter') {
            isFavorited = await this.reader.isFavoritedBy(viewerUserId, breederId);
        }
        return this.mapper.toBreederPublicDto(breeder, isFavorited);
    }
}
