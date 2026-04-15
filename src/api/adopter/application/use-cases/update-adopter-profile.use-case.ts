import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { AdopterProfileUpdateMapperService } from '../../domain/services/adopter-profile-update-mapper.service';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterProfileUpdateResult } from '../types/adopter-result.type';

@Injectable()
export class UpdateAdopterProfileUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        private readonly adopterProfileUpdateMapperService: AdopterProfileUpdateMapperService,
    ) {}

    async execute(
        userId: string,
        updateData: { name?: string; phone?: string; profileImage?: string },
    ): Promise<AdopterProfileUpdateResult> {
        const mappedUpdateData = this.adopterProfileUpdateMapperService.toRecord(updateData);
        const adopter = await this.adopterProfilePort.updateProfile(userId, mappedUpdateData);

        if (!adopter) {
            throw new DomainNotFoundError('입양자 정보를 찾을 수 없습니다.');
        }

        return { message: '프로필이 성공적으로 수정되었습니다.' };
    }
}
