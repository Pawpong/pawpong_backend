import { Injectable } from '@nestjs/common';

import { AdopterRepository } from '../adopter.repository';
import { AdopterProfilePort } from '../application/ports/adopter-profile.port';

@Injectable()
export class AdopterProfileAdapter implements AdopterProfilePort {
    constructor(private readonly adopterRepository: AdopterRepository) {}

    findById(adopterId: string) {
        return this.adopterRepository.findById(adopterId);
    }

    updateProfile(adopterId: string, updateData: any) {
        return this.adopterRepository.updateProfile(adopterId, updateData);
    }

    findFavoriteList(adopterId: string, page: number, limit: number) {
        return this.adopterRepository.findFavoriteList(adopterId, page, limit);
    }

    addFavoriteBreeder(adopterId: string, favoriteData: any) {
        return this.adopterRepository.addFavoriteBreeder(adopterId, favoriteData);
    }

    removeFavoriteBreeder(adopterId: string, breederId: string) {
        return this.adopterRepository.removeFavoriteBreeder(adopterId, breederId);
    }
}
