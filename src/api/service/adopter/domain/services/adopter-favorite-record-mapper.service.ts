import { Injectable } from '@nestjs/common';

import type { FavoriteBreederRecord } from '../../application/ports/adopter-profile.port';
import type { AdopterBreederRecord } from '../../types/adopter-breeder.type';

@Injectable()
export class AdopterFavoriteRecordMapperService {
    toRecord(breederId: string, breeder: AdopterBreederRecord): FavoriteBreederRecord {
        return {
            favoriteBreederId: breederId,
            breederName: breeder.name,
            breederProfileImageUrl: breeder.profileImageFileName || '',
            breederLocation: `${breeder.profile?.location?.city || ''} ${breeder.profile?.location?.district || ''}`,
            addedAt: new Date(),
        };
    }
}
