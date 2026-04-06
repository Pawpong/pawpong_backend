import { Injectable } from '@nestjs/common';

import { HomeAvailablePetSnapshot } from '../../application/ports/home-content-reader.port';

type SignedUrlGenerator = (fileName: string, expirationMinutes?: number) => string;

@Injectable()
export class HomeAvailablePetCatalogService {
    normalizeLimit(limit: number = 10): number {
        const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;
        return Math.min(normalizedLimit, 50);
    }

    buildResponse(
        pets: HomeAvailablePetSnapshot[],
        isAuthenticated: boolean,
        generateSignedUrl: SignedUrlGenerator,
    ): any[] {
        return pets.map((pet) => ({
            petId: pet.id,
            name: pet.name,
            breed: pet.breed,
            breederId: pet.breederId,
            breederName: pet.breederName || '브리더 정보 없음',
            price: isAuthenticated ? pet.price || 0 : null,
            mainPhoto:
                pet.photos.length > 0 ? generateSignedUrl(pet.photos[0], 60) : 'https://via.placeholder.com/300',
            birthDate: pet.birthDate || null,
            ageInMonths: this.calculateAgeInMonths(pet.birthDate),
            location: {
                city: pet.breederCity || '',
                district: pet.breederDistrict || '',
            },
        }));
    }

    private calculateAgeInMonths(birthDate?: Date | string | null): number {
        if (!birthDate) {
            return 0;
        }

        const birth = new Date(birthDate);
        const now = new Date();
        const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

        return Math.max(0, months);
    }
}
