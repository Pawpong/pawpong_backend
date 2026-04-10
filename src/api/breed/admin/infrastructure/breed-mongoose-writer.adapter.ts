import { Injectable } from '@nestjs/common';

import { BreedAdminSnapshot } from '../application/ports/breed-admin-reader.port';
import { BreedWriterPort } from '../application/ports/breed-writer.port';
import { type CreateBreedCommand, type UpdateBreedCommand } from '../application/types/breed-command.type';
import { BreedRepository } from '../../repository/breed.repository';

@Injectable()
export class BreedMongooseWriterAdapter implements BreedWriterPort {
    constructor(private readonly breedRepository: BreedRepository) {}

    async create(dto: CreateBreedCommand): Promise<BreedAdminSnapshot> {
        const saved = await this.breedRepository.create(dto);
        return this.toSnapshot(saved);
    }

    async update(id: string, dto: UpdateBreedCommand): Promise<BreedAdminSnapshot | null> {
        const updated = await this.breedRepository.update(id, dto);
        return updated ? this.toSnapshot(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        return this.breedRepository.deleteById(id);
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
