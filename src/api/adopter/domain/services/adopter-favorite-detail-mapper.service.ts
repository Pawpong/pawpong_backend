import { Injectable } from '@nestjs/common';

import { PriceDisplayType } from '../../../../common/enum/user.enum';
import type { AdopterFavoriteBreederResult } from '../../application/types/adopter-result.type';
import type { FavoriteBreederRecord } from '../../application/ports/adopter-profile.port';
import type { AdopterBreederRecord } from '../../types/adopter-breeder.type';

@Injectable()
export class AdopterFavoriteDetailMapperService {
    toResult(
        favorite: FavoriteBreederRecord,
        breeder: AdopterBreederRecord | null,
        profileImageUrl: string,
        representativePhotos: string[],
    ): AdopterFavoriteBreederResult {
        if (!breeder) {
            return {
                breederId: favorite.favoriteBreederId,
                breederName: favorite.breederName,
                profileImage: favorite.breederProfileImageUrl || '',
                representativePhotos: [],
                location: favorite.breederLocation || '',
                specialization: [],
                averageRating: 0,
                totalReviews: 0,
                priceRange: {
                    min: 0,
                    max: 0,
                    display: PriceDisplayType.CONSULTATION,
                },
                availablePets: 0,
                addedAt: favorite.addedAt,
                isActive: false,
            };
        }

        const profilePrice = breeder.profile?.priceRange || { min: 0, max: 0, display: 'not_set' };
        const priceDisplay =
            profilePrice.display || (profilePrice.min > 0 || profilePrice.max > 0 ? 'range' : 'not_set');

        return {
            breederId: breeder._id.toString(),
            breederName: breeder.name,
            profileImage: profileImageUrl || '',
            representativePhotos: representativePhotos || [],
            breederLevel: breeder.verification?.level || 'new',
            petType: breeder.petType || 'dog',
            location: `${breeder.profile?.location?.city || ''} ${breeder.profile?.location?.district || ''}`.trim(),
            specialization: breeder.breeds || [],
            averageRating: breeder.stats?.averageRating || 0,
            totalReviews: breeder.stats?.totalReviews || 0,
            priceRange: {
                min: profilePrice.min,
                max: profilePrice.max,
                display: priceDisplay as PriceDisplayType,
            },
            availablePets:
                breeder.availablePets?.filter((pet) => pet.status === 'available' && pet.isActive).length || 0,
            addedAt: favorite.addedAt,
            isActive: true,
        };
    }
}
