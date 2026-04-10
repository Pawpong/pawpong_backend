import { Injectable } from '@nestjs/common';

import { AdopterRepository } from '../repository/adopter.repository';
import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import { AdopterProfilePort } from '../application/ports/adopter-profile.port';
import { AdopterBreederFavoriteRepository } from '../repository/adopter-breeder-favorite.repository';
import type { AdopterBreederRecord } from '../types/adopter-breeder.type';
import type { AdopterProfileUpdateRecord, AdopterFavoriteRecord } from '../types/adopter-profile.type';
import type { AdopterProfileRecord } from '../application/ports/adopter-profile.port';

@Injectable()
export class AdopterProfileAdapter implements AdopterProfilePort {
    constructor(
        private readonly adopterRepository: AdopterRepository,
        private readonly breederRepository: BreederRepository,
        private readonly adopterBreederFavoriteRepository: AdopterBreederFavoriteRepository,
    ) {}

    findById(adopterId: string): Promise<AdopterProfileRecord | null>;
    findById(adopterId: string, userRole: string): Promise<AdopterProfileRecord | AdopterBreederRecord | null>;
    findById(adopterId: string, userRole?: string): Promise<AdopterProfileRecord | AdopterBreederRecord | null> {
        if (userRole === 'breeder') {
            return this.breederRepository.findById(adopterId) as Promise<AdopterBreederRecord | null>;
        }

        return this.adopterRepository.findById(adopterId) as Promise<AdopterProfileRecord | null>;
    }

    updateProfile(
        adopterId: string,
        updateData: AdopterProfileUpdateRecord,
    ): Promise<AdopterProfileRecord | null>;
    updateProfile(
        adopterId: string,
        updateData: AdopterProfileUpdateRecord,
        userRole: string,
    ): Promise<AdopterProfileRecord | AdopterBreederRecord | null>;
    updateProfile(
        adopterId: string,
        updateData: AdopterProfileUpdateRecord,
        userRole?: string,
    ): Promise<AdopterProfileRecord | AdopterBreederRecord | null> {
        if (userRole === 'breeder') {
            return this.breederRepository.updateProfile(adopterId, updateData) as Promise<AdopterBreederRecord | null>;
        }

        return this.adopterRepository.updateProfile(adopterId, updateData) as Promise<AdopterProfileRecord | null>;
    }

    async findFavoriteList(adopterId: string, page: number, limit: number, userRole?: string) {
        if (userRole === 'breeder') {
            return this.adopterBreederFavoriteRepository.findFavoriteList(adopterId, page, limit);
        }

        return this.adopterRepository.findFavoriteList(adopterId, page, limit);
    }

    async addFavoriteBreeder(adopterId: string, favoriteData: AdopterFavoriteRecord, userRole?: string) {
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
