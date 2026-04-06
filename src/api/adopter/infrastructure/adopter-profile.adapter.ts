import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AdopterRepository } from '../adopter.repository';
import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import { AdopterProfilePort } from '../application/ports/adopter-profile.port';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';

@Injectable()
export class AdopterProfileAdapter implements AdopterProfilePort {
    constructor(
        private readonly adopterRepository: AdopterRepository,
        private readonly breederRepository: BreederRepository,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
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
            const breeder = await this.breederRepository.findById(adopterId);
            const allFavorites = breeder?.favoriteBreederList || [];
            const startIndex = (page - 1) * limit;

            return {
                favorites: allFavorites.slice(startIndex, startIndex + limit),
                total: allFavorites.length,
            };
        }

        return this.adopterRepository.findFavoriteList(adopterId, page, limit);
    }

    async addFavoriteBreeder(adopterId: string, favoriteData: any, userRole?: string) {
        if (userRole === 'breeder') {
            await this.breederModel.findByIdAndUpdate(adopterId, {
                $push: { favoriteBreederList: favoriteData },
                $set: { updatedAt: new Date() },
            });
            return;
        }

        return this.adopterRepository.addFavoriteBreeder(adopterId, favoriteData);
    }

    async removeFavoriteBreeder(adopterId: string, breederId: string, userRole?: string) {
        if (userRole === 'breeder') {
            await this.breederModel.findByIdAndUpdate(adopterId, {
                $pull: { favoriteBreederList: { favoriteBreederId: breederId } },
                $set: { updatedAt: new Date() },
            });
            return;
        }

        return this.adopterRepository.removeFavoriteBreeder(adopterId, breederId);
    }
}
