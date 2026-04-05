import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AdopterMapper } from '../../mapper/adopter.mapper';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';

@Injectable()
export class UpdateAdopterProfileUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
    ) {}

    async execute(userId: string, updateData: { name?: string; phone?: string; profileImage?: string }): Promise<any> {
        const mappedUpdateData = AdopterMapper.toProfileUpdateData(updateData);
        const adopter = await this.adopterProfilePort.updateProfile(userId, mappedUpdateData);

        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        return { message: '프로필이 성공적으로 수정되었습니다.' };
    }
}
