import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import { AdopterFavoritePolicyService } from '../../domain/services/adopter-favorite-policy.service';

@Injectable()
export class RemoveFavoriteBreederUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        private readonly adopterFavoritePolicyService: AdopterFavoritePolicyService,
    ) {}

    async execute(userId: string, breederId: string): Promise<any> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        this.adopterFavoritePolicyService.ensureCanRemove(adopter.favoriteBreederList || [], breederId);
        await this.adopterProfilePort.removeFavoriteBreeder(userId, breederId);

        return { message: '즐겨찾기에서 브리더를 제거했습니다.' };
    }
}
