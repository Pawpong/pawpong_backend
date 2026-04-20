import { Injectable } from '@nestjs/common';

import { PriceDisplayType } from '../../../../common/enum/user.enum';
import type { BreederFileUrlPort } from '../../application/ports/breeder-file-url.port';
import type { BreederPublicBreederRecord } from '../../application/ports/breeder-public-reader.port';
import type { BreederCardResult } from '../../application/types/breeder-result.type';

type BreederPriceRange = {
    min?: number;
    max?: number;
    display?: string;
};

@Injectable()
export class BreederExploreCardMapperService {
    toExploreCard(
        breeder: BreederPublicBreederRecord,
        breederFileUrlPort: BreederFileUrlPort,
        availableBreederIdSet: Set<string>,
        favoritedBreederIdSet: Set<string>,
    ): BreederCardResult {
        const priceRange = breeder.profile?.priceRange || { min: 0, max: 0, display: 'not_set' };

        return {
            breederId: String(breeder._id),
            breederName: breeder.name,
            breederLevel: breeder.verification?.level || 'new',
            petType: breeder.petType || 'dog',
            location: breeder.profile?.location
                ? `${breeder.profile.location.city} ${breeder.profile.location.district}`
                : '',
            mainBreed: breeder.breeds?.[0] || '',
            isAdoptionAvailable: availableBreederIdSet.has(String(breeder._id)),
            priceRange: {
                min: priceRange.min || 0,
                max: priceRange.max || 0,
                display: this.resolvePriceDisplay(priceRange) as PriceDisplayType,
            },
            favoriteCount: breeder.stats?.totalFavorites || 0,
            isFavorited: favoritedBreederIdSet.has(String(breeder._id)),
            representativePhotos: breederFileUrlPort.generateMany(breeder.profile?.representativePhotos || [], 60),
            profileImage: breederFileUrlPort.generateOneSafe(breeder.profileImageFileName, 60),
            totalReviews: breeder.stats?.totalReviews || 0,
            averageRating: breeder.stats?.averageRating || 0,
            createdAt: breeder.createdAt || new Date(),
        };
    }

    toPopularCard(
        breeder: BreederPublicBreederRecord,
        breederFileUrlPort: BreederFileUrlPort,
        availableBreederIdSet: Set<string>,
    ): BreederCardResult {
        return {
            breederId: String(breeder._id),
            breederName: breeder.name,
            breederLevel: breeder.verification?.level || 'new',
            petType: breeder.petType || 'dog',
            location: breeder.profile?.location
                ? `${breeder.profile.location.city} ${breeder.profile.location.district}`
                : '',
            mainBreed: breeder.breeds?.[0] || '',
            isAdoptionAvailable: availableBreederIdSet.has(String(breeder._id)),
            priceRange: undefined,
            favoriteCount: breeder.stats?.totalFavorites || 0,
            isFavorited: false,
            representativePhotos: breederFileUrlPort.generateMany(breeder.profile?.representativePhotos || [], 60),
            profileImage: breederFileUrlPort.generateOneSafe(breeder.profileImageFileName, 60),
            totalReviews: breeder.stats?.totalReviews || 0,
            averageRating: breeder.stats?.averageRating || 0,
            createdAt: breeder.createdAt || new Date(),
        };
    }

    private resolvePriceDisplay(priceRange: BreederPriceRange): string {
        if (priceRange?.display) {
            return priceRange.display;
        }

        if ((priceRange?.min || 0) > 0 || (priceRange?.max || 0) > 0) {
            return 'range';
        }

        return 'not_set';
    }
}
