import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ProfileMapperService } from '../../domain/services/profile-mapper.service';
import { MyProfileResponseDto } from '../../dto/response/my-profile-response.dto';
import { PROFILE_READER_PORT, type ProfileReaderPort } from '../ports/profile-reader.port';

/**
 * GET /v2/profile/me — 현재 인증된 사용자의 프로필.
 * role 에 따라 입양자/브리더 데이터 소스를 선택해 통합 DTO 로 반환한다.
 */
@Injectable()
export class GetMyProfileUseCase {
    constructor(
        @Inject(PROFILE_READER_PORT)
        private readonly reader: ProfileReaderPort,
        private readonly mapper: ProfileMapperService,
    ) {}

    async execute(userId: string, role: 'adopter' | 'breeder'): Promise<MyProfileResponseDto> {
        if (role === 'adopter') {
            const adopter = await this.reader.readAdopter(userId);
            if (!adopter) throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
            return this.mapper.toMyAdopterDto(adopter);
        }

        const breeder = await this.reader.readBreeder(userId);
        if (!breeder) throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        return this.mapper.toMyBreederDto(breeder);
    }
}
