import { Injectable } from '@nestjs/common';

import type { BreederManagementFileUrlPort } from '../../application/ports/breeder-management-file-url.port';
import type {
    BreederManagementAvailablePetRecord,
    BreederManagementBreederRecord,
    BreederManagementParentPetRecord,
} from '../../application/ports/breeder-management-profile.port';
import type { BreederManagementProfileResult } from '../../application/types/breeder-management-result.type';

@Injectable()
export class BreederManagementProfileAssemblerService {
    toResponse(
        breeder: BreederManagementBreederRecord,
        parentPets: BreederManagementParentPetRecord[],
        availablePets: BreederManagementAvailablePetRecord[],
        fileUrlPort: BreederManagementFileUrlPort,
    ): BreederManagementProfileResult {
        const verificationWithSignedUrls = {
            ...breeder.verification,
            documents: (breeder.verification?.documents || []).map((document) => ({
                type: document.type,
                url: fileUrlPort.generateOne(document.fileName, 60),
                originalFileName: document.originalFileName,
                uploadedAt: document.uploadedAt,
            })),
        };

        const priceRange = breeder.profile?.priceRange;
        const priceRangeMin = priceRange?.min ?? 0;
        const priceRangeMax = priceRange?.max ?? 0;
        const profileWithSignedUrls = breeder.profile
            ? {
                  ...breeder.profile,
                  representativePhotos: fileUrlPort.generateMany(breeder.profile.representativePhotos || [], 60),
                  priceRange: !priceRange
                      ? { min: 0, max: 0, display: 'not_set' }
                      : {
                            min: priceRangeMin,
                            max: priceRangeMax,
                            display:
                                priceRange.display || (priceRangeMin > 0 || priceRangeMax > 0 ? 'range' : 'not_set'),
                        },
              }
            : breeder.profile;

        const parentPetsWithSignedUrls = (parentPets || []).map((pet) => {
            const petObject: BreederManagementParentPetRecord = pet.toObject ? pet.toObject() : pet;
            const photoFileName = petObject.photoFileName;
            const photos = (petObject.photos || []).filter(Boolean);
            const additionalPhotos = photoFileName ? photos.filter((photo) => photo !== photoFileName) : photos;

            return {
                ...petObject,
                petId: String(petObject._id || petObject.petId || ''),
                photoFileName: fileUrlPort.generateOneSafe(photoFileName, 60),
                photos: fileUrlPort.generateMany(additionalPhotos, 60),
            };
        });

        const availablePetsWithSignedUrls = (availablePets || []).map((pet) => ({
            ...pet,
            petId: String(pet._id || pet.petId || ''),
            photos: fileUrlPort.generateMany(pet.photos || [], 60),
        }));

        return {
            breederId: String(breeder._id),
            breederName: breeder.name,
            breederEmail: breeder.emailAddress,
            breederPhone: breeder.phoneNumber,
            authProvider: breeder.socialAuthInfo?.authProvider || 'local',
            marketingAgreed: breeder.marketingAgreed ?? false,
            profileImageFileName: fileUrlPort.generateOneSafe(breeder.profileImageFileName, 60),
            accountStatus: breeder.accountStatus,
            petType: breeder.petType,
            verificationInfo: verificationWithSignedUrls,
            profileInfo: profileWithSignedUrls,
            breeds: breeder.breeds || [],
            parentPetInfo: parentPetsWithSignedUrls,
            availablePetInfo: availablePetsWithSignedUrls,
            applicationForm: breeder.applicationForm,
            statsInfo: breeder.stats,
            consultationAgreed: breeder.consultationAgreed ?? true,
        };
    }
}
