import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Breeder, BreederDocument } from '../../../schema/breeder.schema';

@Injectable()
export class AdopterBreederFavoriteRepository {
    constructor(@InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>) {}

    findById(breederId: string) {
        return this.breederModel.findById(breederId).select('-password').lean().exec();
    }

    async findFavoriteList(breederId: string, page: number, limit: number): Promise<{ favorites: any[]; total: number }> {
        const breeder = await this.breederModel.findById(breederId).select('favoriteBreederList').lean().exec();
        const allFavorites = breeder?.favoriteBreederList || [];
        const startIndex = (page - 1) * limit;

        return {
            favorites: allFavorites.slice(startIndex, startIndex + limit),
            total: allFavorites.length,
        };
    }

    async addFavoriteBreeder(breederId: string, favoriteData: any): Promise<void> {
        await this.breederModel
            .findByIdAndUpdate(breederId, {
                $push: { favoriteBreederList: favoriteData },
                $set: { updatedAt: new Date() },
            })
            .exec();
    }

    async removeFavoriteBreeder(breederId: string, favoriteBreederId: string): Promise<void> {
        await this.breederModel
            .findByIdAndUpdate(breederId, {
                $pull: { favoriteBreederList: { favoriteBreederId } },
                $set: { updatedAt: new Date() },
            })
            .exec();
    }
}
