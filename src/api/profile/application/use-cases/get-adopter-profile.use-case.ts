import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ProfileMapperService } from '../../domain/services/profile-mapper.service';
import { AdopterPublicProfileResponseDto } from '../../dto/response/adopter-profile-response.dto';
import { PROFILE_READER_PORT, type ProfileReaderPort } from '../ports/profile-reader.port';

/**
 * GET /v2/profile/users/:userId — 다른 입양자의 공개 프로필 (유저홈).
 * follow 시스템 미구현이므로 isFollowing 은 항상 false.
 */
@Injectable()
export class GetAdopterProfileUseCase {
    constructor(
        @Inject(PROFILE_READER_PORT)
        private readonly reader: ProfileReaderPort,
        private readonly mapper: ProfileMapperService,
    ) {}

    async execute(targetUserId: string, _viewerUserId?: string): Promise<AdopterPublicProfileResponseDto> {
        const adopter = await this.reader.readAdopter(targetUserId);
        if (!adopter) throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');

        const isFollowing = false; // 입양자→입양자 follow 시스템 도입 시 viewerUserId 활용
        return this.mapper.toAdopterPublicDto(adopter, isFollowing);
    }
}
