import { Injectable } from '@nestjs/common';

import { DomainConflictError, DomainValidationError } from '../../../../common/error/domain.error';
import { FavoriteBreederRecord } from '../../application/ports/adopter-profile.port';

@Injectable()
export class AdopterFavoritePolicyService {
    ensureCanAdd(favoriteBreederList: FavoriteBreederRecord[], breederId: string): void {
        const existingFavorite = favoriteBreederList.find((favorite) => favorite.favoriteBreederId === breederId);
        if (existingFavorite) {
            throw new DomainConflictError('이미 즐겨찾기에 추가된 브리더입니다.');
        }
    }

    ensureCanRemove(favoriteBreederList: FavoriteBreederRecord[], breederId: string): void {
        const existingFavorite = favoriteBreederList.find((favorite) => favorite.favoriteBreederId === breederId);
        if (!existingFavorite) {
            throw new DomainValidationError('즐겨찾기 목록에서 해당 브리더를 찾을 수 없습니다.');
        }
    }
}
