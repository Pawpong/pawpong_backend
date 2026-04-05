import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { AvailablePetManagementRepository } from '../repository/available-pet-management.repository';
import { ParentPetRepository } from '../repository/parent-pet.repository';
import { PetStatus } from '../../../common/enum/user.enum';
import type {
    BreederManagementAvailablePetCommandRecord,
    BreederManagementAvailablePetCreateData,
    BreederManagementAvailablePetUpdateData,
    BreederManagementParentPetCommandRecord,
    BreederManagementParentPetCreateData,
    BreederManagementParentPetUpdateData,
    BreederManagementPetCommandPort,
} from '../application/ports/breeder-management-pet-command.port';

@Injectable()
export class BreederManagementPetCommandAdapter implements BreederManagementPetCommandPort {
    constructor(
        private readonly parentPetRepository: ParentPetRepository,
        private readonly availablePetManagementRepository: AvailablePetManagementRepository,
    ) {}

    findParentPetByIdAndBreeder(
        petId: string,
        breederId: string,
    ): Promise<BreederManagementParentPetCommandRecord | null> {
        return this.parentPetRepository.findByIdAndBreeder(
            petId,
            breederId,
        ) as Promise<BreederManagementParentPetCommandRecord | null>;
    }

    createParentPet(data: BreederManagementParentPetCreateData): Promise<BreederManagementParentPetCommandRecord> {
        return this.parentPetRepository.create({
            breederId: new Types.ObjectId(data.breederId) as any,
            name: data.name,
            breed: data.breed,
            gender: data.gender,
            birthDate: data.birthDate,
            photoFileName: data.photoFileName,
            description: data.description,
            photos: data.photos,
            isActive: data.isActive,
        }) as Promise<BreederManagementParentPetCommandRecord>;
    }

    updateParentPet(
        petId: string,
        updateData: BreederManagementParentPetUpdateData,
    ): Promise<BreederManagementParentPetCommandRecord | null> {
        return this.parentPetRepository.update(
            petId,
            updateData as Record<string, unknown>,
        ) as Promise<BreederManagementParentPetCommandRecord | null>;
    }

    deleteParentPet(petId: string): Promise<BreederManagementParentPetCommandRecord | null> {
        return this.parentPetRepository.delete(petId) as Promise<BreederManagementParentPetCommandRecord | null>;
    }

    findAvailablePetByIdAndBreeder(
        petId: string,
        breederId: string,
    ): Promise<BreederManagementAvailablePetCommandRecord | null> {
        return this.availablePetManagementRepository.findByIdAndBreeder(
            petId,
            breederId,
        ) as Promise<BreederManagementAvailablePetCommandRecord | null>;
    }

    createAvailablePet(
        data: BreederManagementAvailablePetCreateData,
    ): Promise<BreederManagementAvailablePetCommandRecord> {
        return this.availablePetManagementRepository.create({
            breederId: new Types.ObjectId(data.breederId) as any,
            name: data.name,
            breed: data.breed,
            gender: data.gender,
            birthDate: data.birthDate,
            price: data.price,
            status: data.status,
            photos: data.photos,
            description: data.description,
            parentInfo: data.parentInfo
                ? {
                      mother: data.parentInfo.mother as any,
                      father: data.parentInfo.father as any,
                  }
                : undefined,
        }) as Promise<BreederManagementAvailablePetCommandRecord>;
    }

    updateAvailablePet(
        petId: string,
        updateData: BreederManagementAvailablePetUpdateData,
    ): Promise<BreederManagementAvailablePetCommandRecord | null> {
        return this.availablePetManagementRepository.update(
            petId,
            updateData as Record<string, unknown>,
        ) as Promise<BreederManagementAvailablePetCommandRecord | null>;
    }

    updateAvailablePetStatus(
        petId: string,
        status: PetStatus,
    ): Promise<BreederManagementAvailablePetCommandRecord | null> {
        return this.availablePetManagementRepository.updateStatus(
            petId,
            status,
        ) as Promise<BreederManagementAvailablePetCommandRecord | null>;
    }

    deleteAvailablePet(petId: string): Promise<BreederManagementAvailablePetCommandRecord | null> {
        return this.availablePetManagementRepository.delete(
            petId,
        ) as Promise<BreederManagementAvailablePetCommandRecord | null>;
    }
}
