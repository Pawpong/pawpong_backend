import { Injectable } from '@nestjs/common';

import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import type { AdopterBreederReaderPort } from '../application/ports/adopter-breeder-reader.port';
import type { AdopterBreederRecord } from '../types/adopter-breeder.type';

@Injectable()
export class AdopterBreederReaderAdapter implements AdopterBreederReaderPort {
    constructor(private readonly breederRepository: BreederRepository) {}

    async findById(breederId: string): Promise<AdopterBreederRecord | null> {
        const breeder = await this.breederRepository.findById(breederId);
        if (!breeder) {
            return null;
        }

        return {
            ...breeder,
            profileImageFileName: breeder.profileImageFileName ?? undefined,
            profile: breeder.profile
                ? {
                      ...breeder.profile,
                      priceRange: breeder.profile.priceRange
                          ? {
                                min: breeder.profile.priceRange.min ?? 0,
                                max: breeder.profile.priceRange.max ?? 0,
                                display: breeder.profile.priceRange.display,
                            }
                          : undefined,
                  }
                : undefined,
        };
    }
}
