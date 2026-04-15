import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import { AdopterFavoritePolicyService } from '../../domain/services/adopter-favorite-policy.service';
import type { AdopterFavoriteCommandResult } from '../types/adopter-result.type';

@Injectable()
export class RemoveFavoriteBreederUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        private readonly adopterFavoritePolicyService: AdopterFavoritePolicyService,
    ) {}

    async execute(userId: string, breederId: string, userRole?: string): Promise<AdopterFavoriteCommandResult> {
        const adopter = await this.adopterProfilePort.findById(userId, userRole);
        if (!adopter) {
            throw new DomainNotFoundError(
                userRole === 'breeder' ? '브리더 정보를 찾을 수 없습니다.' : '입양자 정보를 찾을 수 없습니다.',
            );
        }

        this.adopterFavoritePolicyService.ensureCanRemove(adopter.favoriteBreederList || [], breederId);
        await this.adopterProfilePort.removeFavoriteBreeder(userId, breederId, userRole);

        return { message: '즐겨찾기에서 브리더를 제거했습니다.' };
    }
}
