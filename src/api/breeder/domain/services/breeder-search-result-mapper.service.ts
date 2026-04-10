import { Injectable } from '@nestjs/common';

import type { BreederFileUrlPort } from '../../application/ports/breeder-file-url.port';
import type { BreederPublicBreederRecord } from '../../application/ports/breeder-public-reader.port';
import type { BreederSearchItemResult } from '../../application/types/breeder-result.type';

@Injectable()
export class BreederSearchResultMapperService {
    toItem(breeder: BreederPublicBreederRecord, breederFileUrlPort: BreederFileUrlPort): BreederSearchItemResult {
        return {
            breederId: String(breeder._id),
            breederName: breeder.name,
            location: breeder.profile?.location?.city || 'Unknown',
            specialization: breeder.profile?.specialization || '',
            averageRating: breeder.stats?.averageRating || 0,
            totalReviews: breeder.stats?.totalReviews || 0,
            profileImage: breeder.profileImageFileName
                ? breederFileUrlPort.generateOne(breeder.profileImageFileName, 60 * 24)
                : undefined,
            profilePhotos: breederFileUrlPort.generateMany(breeder.profile?.representativePhotos || [], 60 * 24),
            verificationStatus: breeder.verification?.status || 'pending',
            availablePets: (breeder as any).availablePets?.length || 0,
        };
    }
}
