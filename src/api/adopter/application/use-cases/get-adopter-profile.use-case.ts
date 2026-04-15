import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { AdopterProfileResultMapperService } from '../../domain/services/adopter-profile-result-mapper.service';
import { ADOPTER_FILE_URL_PORT } from '../ports/adopter-file-url.port';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterFileUrlPort } from '../ports/adopter-file-url.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterProfileResult } from '../types/adopter-result.type';

@Injectable()
export class GetAdopterProfileUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_FILE_URL_PORT)
        private readonly adopterFileUrlPort: AdopterFileUrlPort,
        private readonly adopterProfileResultMapperService: AdopterProfileResultMapperService,
    ) {}

    async execute(userId: string): Promise<AdopterProfileResult> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new DomainNotFoundError('입양자 정보를 찾을 수 없습니다.');
        }

        const profileResponse = this.adopterProfileResultMapperService.toResult(adopter);

        if (profileResponse.profileImageFileName) {
            profileResponse.profileImageFileName =
                this.adopterFileUrlPort.generateOneSafe(profileResponse.profileImageFileName, 60);
        }

        return profileResponse;
    }
}
