import { Injectable } from '@nestjs/common';

import type { BreederPetPostingWriterPort } from '../application/ports/breeder-pet-posting-writer.port';
import type {
    BreederPetPostingCreatePersistData,
    BreederPetPostingUpdatePersistData,
} from '../application/types/breeder-pet-posting-command.type';
import { BreederPetPostingRepository } from '../repository/breeder-pet-posting.repository';

@Injectable()
export class BreederPetPostingWriterMongooseAdapter implements BreederPetPostingWriterPort {
    constructor(private readonly repository: BreederPetPostingRepository) {}

    async create(data: BreederPetPostingCreatePersistData): Promise<{ petId: string }> {
        const created = await this.repository.create(data);
        return { petId: created._id };
    }

    updateByOwner(
        petId: string,
        breederId: string,
        patch: BreederPetPostingUpdatePersistData,
    ): Promise<{ changed: boolean }> {
        return this.repository.updateByOwner(petId, breederId, patch);
    }

    softDeleteByOwner(petId: string, breederId: string): Promise<{ changed: boolean }> {
        return this.repository.softDeleteByOwner(petId, breederId);
    }
}
