import { Injectable } from '@nestjs/common';

import { ApplicationStatus, PetStatus } from '../../../common/enum/user.enum';

import { AdoptionApplicationRepository } from '../repository/adoption-application.repository';
import { AvailablePetManagementRepository } from '../repository/available-pet-management.repository';
import { BreederRepository } from '../repository/breeder.repository';
import { ParentPetRepository } from '../repository/parent-pet.repository';
import type {
    BreederManagementAvailablePetRecord,
    BreederManagementBreederRecord,
    BreederManagementParentPetRecord,
    BreederManagementProfilePort,
    BreederManagementRecentApplicationRecord,
} from '../application/ports/breeder-management-profile.port';

@Injectable()
export class BreederManagementProfileAdapter implements BreederManagementProfilePort {
    constructor(
        private readonly breederRepository: BreederRepository,
        private readonly parentPetRepository: ParentPetRepository,
        private readonly availablePetManagementRepository: AvailablePetManagementRepository,
        private readonly adoptionApplicationRepository: AdoptionApplicationRepository,
    ) {}

    findById(breederId: string): Promise<BreederManagementBreederRecord | null> {
        return this.breederRepository.findById(breederId) as Promise<BreederManagementBreederRecord | null>;
    }

    findByIdWithAllData(breederId: string): Promise<BreederManagementBreederRecord | null> {
        return this.breederRepository.findByIdWithAllData(
            breederId,
        ) as Promise<BreederManagementBreederRecord | null>;
    }

    updateProfile(
        breederId: string,
        updateData: Record<string, unknown>,
    ): Promise<BreederManagementBreederRecord | null> {
        return this.breederRepository.updateProfile(
            breederId,
            updateData,
        ) as Promise<BreederManagementBreederRecord | null>;
    }

    findActiveParentPetsByBreederId(breederId: string): Promise<BreederManagementParentPetRecord[]> {
        return this.parentPetRepository.findByBreederId(
            breederId,
            true,
        ) as unknown as Promise<BreederManagementParentPetRecord[]>;
    }

    async findActiveAvailablePetsByBreederId(breederId: string): Promise<BreederManagementAvailablePetRecord[]> {
        const result = await this.availablePetManagementRepository.findByBreederIdWithFilters(breederId, {
            includeInactive: false,
        });

        return result.pets as unknown as BreederManagementAvailablePetRecord[];
    }

    countPendingApplications(breederId: string): Promise<number> {
        return this.adoptionApplicationRepository.countByStatus(breederId, ApplicationStatus.CONSULTATION_PENDING);
    }

    findRecentApplications(
        breederId: string,
        limit: number,
    ): Promise<BreederManagementRecentApplicationRecord[]> {
        return this.adoptionApplicationRepository.findRecentByBreeder(
            breederId,
            limit,
        ) as Promise<BreederManagementRecentApplicationRecord[]>;
    }

    countActiveAvailablePets(breederId: string): Promise<number> {
        return this.availablePetManagementRepository.countByStatus(breederId, PetStatus.AVAILABLE, true);
    }
}
