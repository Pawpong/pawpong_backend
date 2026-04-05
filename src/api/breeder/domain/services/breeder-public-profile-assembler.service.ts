import { Injectable } from '@nestjs/common';

import { PriceDisplayType } from '../../../../common/enum/user.enum';
import type { BreederFileUrlPort } from '../../application/ports/breeder-file-url.port';
import type { BreederPublicBreederRecord, BreederPublicPetRecord } from '../../application/ports/breeder-public-reader.port';
import { BreederProfileResponseDto } from '../../dto/response/breeder-profile-response.dto';
import { BreederBirthDateFormatterService } from './breeder-birth-date-formatter.service';

@Injectable()
export class BreederPublicProfileAssemblerService {
    constructor(private readonly breederBirthDateFormatterService: BreederBirthDateFormatterService) {}

    toResponse(
        breeder: BreederPublicBreederRecord,
        isFavorited: boolean,
        availablePets: BreederPublicPetRecord[],
        parentPets: BreederPublicPetRecord[],
        breederFileUrlPort: BreederFileUrlPort,
    ): BreederProfileResponseDto {
        const profilePrice = breeder.profile?.priceRange || { min: 0, max: 0, display: 'not_set' };
        const finalDisplay = profilePrice.display
            ? profilePrice.display
            : profilePrice.min || profilePrice.max
              ? 'range'
              : 'not_set';

        const representativePhotoUrls = breederFileUrlPort.generateMany(
            breeder.profile?.representativePhotos || [],
            60 * 24,
        );

        return {
            breederId: String(breeder._id),
            breederName: breeder.name,
            breederEmail: breeder.emailAddress,
            authProvider: breeder.socialAuthInfo?.authProvider || 'local',
            breederLevel: breeder.verification?.level || 'new',
            petType: breeder.petType || 'dog',
            detailBreed: (breeder as any).detailBreed,
            breeds: breeder.breeds || [],
            location: breeder.profile?.location
                ? `${breeder.profile.location.city} ${breeder.profile.location.district}`
                : '',
            priceRange: {
                min: profilePrice.min || 0,
                max: profilePrice.max || 0,
                display: finalDisplay as PriceDisplayType,
            },
            profileImage: breeder.profileImageFileName
                ? breederFileUrlPort.generateOne(breeder.profileImageFileName, 60 * 24)
                : undefined,
            favoriteCount: breeder.stats?.totalFavorites || 0,
            isFavorited,
            description: breeder.profile?.description || '',
            representativePhotos: representativePhotoUrls,
            availablePets: availablePets.map((pet) => ({
                petId: String(pet._id),
                name: pet.name,
                breed: pet.breed,
                gender: pet.gender,
                birthDate: pet.birthDate,
                price: pet.price,
                status: pet.status,
                description: pet.description || '',
                photo: breederFileUrlPort.generateMany(pet.photos || [], 60 * 24)[0] || '',
                photos: breederFileUrlPort.generateMany(pet.photos || [], 60 * 24),
                parents: this.toParentCards(pet.parentInfo, breederFileUrlPort),
            })),
            parentPets: parentPets.map((pet) => ({
                petId: String(pet._id),
                name: pet.name,
                breed: pet.breed,
                gender: pet.gender,
                birthDate: pet.birthDate,
                photo: breederFileUrlPort.generateMany(pet.photos || [], 60 * 24)[0] || '',
                photos: breederFileUrlPort.generateMany(pet.photos || [], 60 * 24),
            })),
            reviews: ((breeder.reviews || []).filter((review) => review.isVisible) || []).slice(-5).map((review) => ({
                reviewId: review.reviewId,
                writtenAt: review.writtenAt,
                type: review.type,
                adopterName: review.adopterName,
                rating: review.rating,
                content: review.content,
                photo: review.photos?.[0] || undefined,
            })),
            reviewStats: {
                totalReviews: breeder.stats?.totalReviews || 0,
                averageRating: breeder.stats?.averageRating || 0,
            },
            createdAt: breeder.createdAt,
        } as unknown as BreederProfileResponseDto;
    }

    private toParentCards(parentInfo: BreederPublicPetRecord['parentInfo'], breederFileUrlPort: BreederFileUrlPort) {
        const parentCards: any[] = [];

        if (parentInfo?.mother) {
            const motherPhotos = breederFileUrlPort.generateMany(parentInfo.mother.photos || [], 60 * 24);
            parentCards.push({
                id: String(parentInfo.mother._id),
                avatarUrl:
                    motherPhotos[0] ||
                    (parentInfo.mother.photoFileName
                        ? breederFileUrlPort.generateOne(parentInfo.mother.photoFileName, 60 * 24)
                        : ''),
                name: parentInfo.mother.name,
                sex: parentInfo.mother.gender,
                birth: this.breederBirthDateFormatterService.formatToKorean(parentInfo.mother.birthDate),
                breed: parentInfo.mother.breed,
                photos: motherPhotos,
            });
        }

        if (parentInfo?.father) {
            const fatherPhotos = breederFileUrlPort.generateMany(parentInfo.father.photos || [], 60 * 24);
            parentCards.push({
                id: String(parentInfo.father._id),
                avatarUrl:
                    fatherPhotos[0] ||
                    (parentInfo.father.photoFileName
                        ? breederFileUrlPort.generateOne(parentInfo.father.photoFileName, 60 * 24)
                        : ''),
                name: parentInfo.father.name,
                sex: parentInfo.father.gender,
                birth: this.breederBirthDateFormatterService.formatToKorean(parentInfo.father.birthDate),
                breed: parentInfo.father.breed,
                photos: fatherPhotos,
            });
        }

        return parentCards;
    }
}
