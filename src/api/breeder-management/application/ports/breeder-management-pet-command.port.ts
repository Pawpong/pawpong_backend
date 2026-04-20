import { PetStatus } from '../../../../common/enum/user.enum';

export const BREEDER_MANAGEMENT_PET_COMMAND_PORT = Symbol('BREEDER_MANAGEMENT_PET_COMMAND_PORT');

export interface BreederManagementParentPetCreateData {
    breederId: string;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    photoFileName?: string;
    description: string;
    photos: string[];
    isActive: boolean;
}

export interface BreederManagementParentPetUpdateData {
    name?: string;
    breed?: string;
    gender?: string;
    birthDate?: Date;
    photoFileName?: string;
    description?: string;
    photos?: string[];
}

export interface BreederManagementAvailablePetCreateData {
    breederId: string;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    price: number;
    status: PetStatus;
    photos: string[];
    description: string;
    parentInfo?: {
        mother?: string;
        father?: string;
    };
}

export interface BreederManagementAvailablePetUpdateData {
    name?: string;
    breed?: string;
    gender?: string;
    birthDate?: Date;
    price?: number;
    description?: string;
    photos?: string[];
    parentInfo?: {
        mother?: string;
        father?: string;
    };
}

export interface BreederManagementParentPetCommandRecord {
    _id?: unknown;
    name?: string;
}

export interface BreederManagementAvailablePetCommandRecord {
    _id?: unknown;
    name?: string;
    status?: string;
}

export interface BreederManagementPetCommandPort {
    findParentPetByIdAndBreeder(
        petId: string,
        breederId: string,
    ): Promise<BreederManagementParentPetCommandRecord | null>;
    createParentPet(data: BreederManagementParentPetCreateData): Promise<BreederManagementParentPetCommandRecord>;
    updateParentPet(
        petId: string,
        updateData: BreederManagementParentPetUpdateData,
    ): Promise<BreederManagementParentPetCommandRecord | null>;
    deleteParentPet(petId: string): Promise<BreederManagementParentPetCommandRecord | null>;
    findAvailablePetByIdAndBreeder(
        petId: string,
        breederId: string,
    ): Promise<BreederManagementAvailablePetCommandRecord | null>;
    createAvailablePet(
        data: BreederManagementAvailablePetCreateData,
    ): Promise<BreederManagementAvailablePetCommandRecord>;
    updateAvailablePet(
        petId: string,
        updateData: BreederManagementAvailablePetUpdateData,
    ): Promise<BreederManagementAvailablePetCommandRecord | null>;
    updateAvailablePetStatus(
        petId: string,
        status: PetStatus,
    ): Promise<BreederManagementAvailablePetCommandRecord | null>;
    deleteAvailablePet(petId: string): Promise<BreederManagementAvailablePetCommandRecord | null>;
}
