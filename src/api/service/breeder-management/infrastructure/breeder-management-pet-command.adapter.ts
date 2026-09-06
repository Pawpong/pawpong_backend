import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { AvailablePetManagementRepository } from '../repository/available-pet-management.repository';
import { BreederRepository } from '../repository/breeder.repository';
import { ParentPetRepository } from '../repository/parent-pet.repository';
import { PetStatus } from '../../../../common/enum/user.enum';
import type {
    BreederManagementAvailablePetCommandRecord,
    BreederManagementAvailablePetCreateData,
    BreederManagementAvailablePetUpdateData,
    BreederManagementParentPetCommandRecord,
    BreederManagementParentPetCreateData,
    BreederManagementParentPetUpdateData,
    BreederManagementPetCommandPort,
} from '../application/ports/breeder-management-pet-command.port';
import type {
    BreederManagementAvailablePetPersistencePayload,
    BreederManagementParentPetPersistencePayload,
} from '../types/breeder-management-document.type';

/** available_pets.petType 이 가질 수 있는 값 — breeders.petType 과 동일한 enum */
const AVAILABLE_PET_TYPES = ['dog', 'cat', 'reptile'] as const;
type AvailablePetType = (typeof AVAILABLE_PET_TYPES)[number];

@Injectable()
export class BreederManagementPetCommandAdapter implements BreederManagementPetCommandPort {
    constructor(
        private readonly parentPetRepository: ParentPetRepository,
        private readonly availablePetManagementRepository: AvailablePetManagementRepository,
        private readonly breederRepository: BreederRepository,
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
        const createData: BreederManagementParentPetPersistencePayload = {
            breederId: new Types.ObjectId(data.breederId),
            name: data.name,
            breed: data.breed,
            gender: data.gender,
            birthDate: data.birthDate,
            photoFileName: data.photoFileName,
            description: data.description,
            photos: data.photos,
            isActive: data.isActive,
        };

        return this.parentPetRepository.create(createData) as Promise<BreederManagementParentPetCommandRecord>;
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

    /**
     * 분양 가능 동물 생성.
     *
     * petType 은 클라이언트가 아니라 글쓴 브리더 계정(breeders.petType)에서 파생한다.
     * 브리더 1명 = 1축종이 스키마상 보장되며, 이 값이 탐색 페이지 축종 탭 필터의 근거다.
     */
    async createAvailablePet(
        data: BreederManagementAvailablePetCreateData,
    ): Promise<BreederManagementAvailablePetCommandRecord> {
        const breeder = await this.breederRepository.findById(data.breederId);
        const createData: BreederManagementAvailablePetPersistencePayload = {
            breederId: new Types.ObjectId(data.breederId),
            petType: toAvailablePetType(breeder?.petType),
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
                      mother: data.parentInfo.mother ? new Types.ObjectId(data.parentInfo.mother) : undefined,
                      father: data.parentInfo.father ? new Types.ObjectId(data.parentInfo.father) : undefined,
                  }
                : undefined,
        };

        return this.availablePetManagementRepository.create(
            createData,
        ) as Promise<BreederManagementAvailablePetCommandRecord>;
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

/** enum 밖 값이 저장된 레거시 브리더 문서를 걸러낸다. */
function toAvailablePetType(value: unknown): AvailablePetType | undefined {
    return AVAILABLE_PET_TYPES.includes(value as AvailablePetType) ? (value as AvailablePetType) : undefined;
}
