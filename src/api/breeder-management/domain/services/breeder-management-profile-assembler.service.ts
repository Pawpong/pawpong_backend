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

        const priceRange = (breeder.profile as any)?.priceRange;
        const profileWithSignedUrls = breeder.profile
            ? {
                  ...breeder.profile,
                  representativePhotos: fileUrlPort.generateMany(
                      ((breeder.profile as any)?.representativePhotos || []) as string[],
                      60,
                  ),
                  priceRange: !priceRange
                      ? { min: 0, max: 0, display: 'not_set' }
                      : {
                            min: priceRange.min || 0,
                            max: priceRange.max || 0,
                            display: priceRange.display || (priceRange.min > 0 || priceRange.max > 0 ? 'range' : 'not_set'),
                        },
              }
            : breeder.profile;

        const parentPetsWithSignedUrls = (parentPets || []).map((pet) => {
            const petObject = pet.toObject ? pet.toObject() : pet;
            const photoFileName = petObject.photoFileName as string | null | undefined;
            const photos = ((petObject.photos as string[] | undefined) || []).filter(Boolean);
            const additionalPhotos = photoFileName ? photos.filter((photo) => photo !== photoFileName) : photos;

            return {
                ...petObject,
                petId: String((pet as any)._id || (pet as any).petId || ''),
                photoFileName: fileUrlPort.generateOneSafe(photoFileName, 60),
                photos: fileUrlPort.generateMany(additionalPhotos, 60),
            };
        });

        const availablePetsWithSignedUrls = (availablePets || []).map((pet) => ({
            ...pet,
            petId: String((pet as any)._id || pet.petId || ''),
            photos: fileUrlPort.generateMany((pet.photos || []) as string[], 60),
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
