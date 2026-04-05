import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AdopterMapper } from '../../mapper/adopter.mapper';
import { AdopterProfileResponseDto } from '../../dto/response/adopter-profile-response.dto';
import { ADOPTER_FILE_URL_PORT } from '../ports/adopter-file-url.port';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterFileUrlPort } from '../ports/adopter-file-url.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';

@Injectable()
export class GetAdopterProfileUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_FILE_URL_PORT)
        private readonly adopterFileUrlPort: AdopterFileUrlPort,
    ) {}

    async execute(userId: string): Promise<AdopterProfileResponseDto> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        const profileResponse = AdopterMapper.toProfileResponse(adopter);

        if (profileResponse.profileImageFileName) {
            profileResponse.profileImageFileName =
                this.adopterFileUrlPort.generateOneSafe(profileResponse.profileImageFileName, 60);
        }

        return profileResponse;
    }
}
