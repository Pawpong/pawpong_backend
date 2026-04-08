import { Injectable } from '@nestjs/common';

import { BreedAdminReaderPort, BreedAdminSnapshot } from '../application/ports/breed-admin-reader.port';
import { BreedRepository } from '../../repository/breed.repository';

@Injectable()
export class BreedMongooseAdminReaderAdapter implements BreedAdminReaderPort {
    constructor(private readonly breedRepository: BreedRepository) {}

    async readAll(): Promise<BreedAdminSnapshot[]> {
        const breeds = await this.breedRepository.findAllSorted();
        return breeds.map((breed) => this.toSnapshot(breed));
    }

    async findById(id: string): Promise<BreedAdminSnapshot | null> {
        const breed = await this.breedRepository.findById(id);
        return breed ? this.toSnapshot(breed) : null;
    }

    async findByPetTypeAndCategory(
        petType: string,
        category: string,
        excludeId?: string,
    ): Promise<BreedAdminSnapshot | null> {
        const breed = await this.breedRepository.findByPetTypeAndCategory(petType, category, excludeId);
        return breed ? this.toSnapshot(breed) : null;
    }

    private toSnapshot(breed: any): BreedAdminSnapshot {
        return {
            id: breed._id.toString(),
            petType: breed.petType,
            category: breed.category,
            categoryDescription: breed.categoryDescription,
            breeds: breed.breeds,
            createdAt: breed.createdAt,
            updatedAt: breed.updatedAt,
        };
    }
}
