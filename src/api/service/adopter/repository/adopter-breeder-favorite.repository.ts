import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import type { FavoriteBreederRecord } from '../application/ports/adopter-profile.port';
import type { AdopterBreederRecord } from '../types/adopter-breeder.type';
import { CONTENT_RIGHTS_VERSION, isIosAppRequest } from '../../../../common/content-rights/app-request-context';

@Injectable()
export class AdopterBreederFavoriteRepository {
    constructor(@InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>) {}

    findById(breederId: string): Promise<AdopterBreederRecord | null> {
        return this.breederModel
            .findOne({ _id: breederId, ...(isIosAppRequest() ? { contentRightsConsentVersion: CONTENT_RIGHTS_VERSION } : {}) })
            .select('-password')
            .lean()
            .exec() as Promise<AdopterBreederRecord | null>;
    }

    async findFavoriteList(
        breederId: string,
        page: number,
        limit: number,
    ): Promise<{ favorites: FavoriteBreederRecord[]; total: number }> {
        const breeder = await this.breederModel.findById(breederId).select('favoriteBreederList').lean().exec();
        let allFavorites = breeder?.favoriteBreederList || [];
        if (isIosAppRequest() && allFavorites.length > 0) {
            const approvedIds = await this.breederModel.distinct('_id', {
                _id: { $in: allFavorites.map((item) => item.favoriteBreederId) },
                contentRightsConsentVersion: CONTENT_RIGHTS_VERSION,
            });
            const approved = new Set(approvedIds.map(String));
            allFavorites = allFavorites.filter((item) => approved.has(item.favoriteBreederId));
        }
        const startIndex = (page - 1) * limit;

        return {
            favorites: allFavorites.slice(startIndex, startIndex + limit),
            total: allFavorites.length,
        };
    }

    async addFavoriteBreeder(breederId: string, favoriteData: FavoriteBreederRecord): Promise<void> {
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
