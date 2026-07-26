import { Injectable } from '@nestjs/common';

import { UploadOwnerPort, UploadPhotoTarget } from '../application/ports/upload-owner.port';
import { UploadOwnerRepository } from '../repository/upload-owner.repository';

@Injectable()
export class UploadMongooseOwnerAdapter implements UploadOwnerPort {
    constructor(private readonly uploadOwnerRepository: UploadOwnerRepository) {}

    async replaceRepresentativePhotos(breederId: string, photoPaths: string[]): Promise<void> {
        await this.uploadOwnerRepository.updateRepresentativePhotos(breederId, photoPaths);
    }

    async findOwnedAvailablePet(petId: string, breederId: string): Promise<UploadPhotoTarget | null> {
        const pet = await this.uploadOwnerRepository.findAvailablePetByIdAndBreeder(petId, breederId);
        if (!pet) {
            return null;
        }

        return { photoPaths: [...(pet.photos || [])] };
    }

    async replaceAvailablePetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void> {
        await this.uploadOwnerRepository.updateAvailablePetPhotos(petId, breederId, photoPaths);
    }

    async findOwnedParentPet(petId: string, breederId: string): Promise<UploadPhotoTarget | null> {
        const pet = await this.uploadOwnerRepository.findParentPetByIdAndBreeder(petId, breederId);
        if (!pet) {
            return null;
        }

        return { photoPaths: [...(pet.photos || [])] };
    }

    async replaceParentPetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void> {
        await this.uploadOwnerRepository.updateParentPetPhotos(petId, breederId, photoPaths);
    }
}
