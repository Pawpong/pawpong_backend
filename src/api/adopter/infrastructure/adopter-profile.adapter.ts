import { Injectable } from '@nestjs/common';

import { AdopterRepository } from '../adopter.repository';
import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import { AdopterProfilePort } from '../application/ports/adopter-profile.port';
import { AdopterBreederFavoriteRepository } from '../repository/adopter-breeder-favorite.repository';

@Injectable()
export class AdopterProfileAdapter implements AdopterProfilePort {
    constructor(
        private readonly adopterRepository: AdopterRepository,
        private readonly breederRepository: BreederRepository,
        private readonly adopterBreederFavoriteRepository: AdopterBreederFavoriteRepository,
    ) {}

    findById(adopterId: string, userRole?: string) {
        if (userRole === 'breeder') {
            return this.breederRepository.findById(adopterId) as any;
        }

        return this.adopterRepository.findById(adopterId);
    }

    updateProfile(adopterId: string, updateData: any, userRole?: string) {
        if (userRole === 'breeder') {
            return this.breederRepository.updateProfile(adopterId, updateData) as any;
        }

        return this.adopterRepository.updateProfile(adopterId, updateData);
    }

    async findFavoriteList(adopterId: string, page: number, limit: number, userRole?: string) {
        if (userRole === 'breeder') {
            return this.adopterBreederFavoriteRepository.findFavoriteList(adopterId, page, limit);
        }

        return this.adopterRepository.findFavoriteList(adopterId, page, limit);
    }

    async addFavoriteBreeder(adopterId: string, favoriteData: any, userRole?: string) {
        if (userRole === 'breeder') {
            return this.adopterBreederFavoriteRepository.addFavoriteBreeder(adopterId, favoriteData);
        }

        return this.adopterRepository.addFavoriteBreeder(adopterId, favoriteData);
    }

    async removeFavoriteBreeder(adopterId: string, breederId: string, userRole?: string) {
        if (userRole === 'breeder') {
            return this.adopterBreederFavoriteRepository.removeFavoriteBreeder(adopterId, breederId);
        }

        return this.adopterRepository.removeFavoriteBreeder(adopterId, breederId);
    }
}
